import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { sortProjectsByTrending } from "@/lib/trending"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sort = searchParams.get("sort") || "recent"
    const search = searchParams.get("search") || ""
    const tag = searchParams.get("tag") || ""

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      published: true,
    }

    if (search) {
      // SQLite doesn't support case-insensitive search with mode, so we use contains directly
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { techStack: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    if (tag) {
      where.tags = { contains: tag }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" }

    if (sort === "stars") {
      orderBy = { stars: { _count: "desc" } }
    }

    // For trending, we fetch all projects and sort them using our algorithm
    const projectQuery = {
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            stars: true,
            vibes: true,
            comments: true,
          },
        },
        stars: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            }
          : false,
        vibes: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                id: true,
                type: true,
              },
            }
          : false,
      },
    }

    let projects
    if (sort === "trending") {
      // Get more projects for trending algorithm, then slice
      const allProjects = await prisma.project.findMany({
        ...projectQuery,
        orderBy: { createdAt: "desc" },
        take: Math.max(limit * 3, 50), // Get more projects to sort
      })

      const sortedProjects = sortProjectsByTrending(allProjects)
      projects = sortedProjects.slice(offset, offset + limit)
    } else {
      projects = await prisma.project.findMany({
        ...projectQuery,
        orderBy,
        skip: offset,
        take: limit,
      })
    }

    // Add isStarred and userVibes fields to each project
    const projectsWithStarStatus = projects.map((project) => ({
      ...project,
      isStarred: userId ? project.stars.length > 0 : false,
      userVibes: userId ? project.vibes.map((v: any) => v.type) : [],
      stars: undefined, // Remove the stars array from response
      vibes: undefined, // Remove the vibes array from response
    }))

    const total = await prisma.project.count({ where })

    return NextResponse.json({
      projects: projectsWithStarStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    })

    const body = await request.json()
    const {
      title,
      description,
      demoUrl,
      githubUrl,
      imageUrl,
      tags,
      techStack,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
      websiteUrl,
    } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    // Validate at least one link (project or social)
    const hasAnyLink = demoUrl || githubUrl || twitterUrl || linkedinUrl || youtubeUrl || websiteUrl
    if (!hasAnyLink) {
      return NextResponse.json(
        { error: "At least one link (demo, GitHub, or social) is required" },
        { status: 400 }
      )
    }

    // Update user's social links
    await prisma.user.update({
      where: { id: userId },
      data: {
        twitterUrl: twitterUrl || null,
        linkedinUrl: linkedinUrl || null,
        youtubeUrl: youtubeUrl || null,
        websiteUrl: websiteUrl || null,
      },
    })

    const project = await prisma.project.create({
      data: {
        title,
        description,
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        imageUrl: imageUrl || null,
        tags: tags ? JSON.stringify(tags) : null,
        techStack: techStack ? JSON.stringify(techStack) : null,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            stars: true,
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}