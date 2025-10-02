import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { userId } = await auth()
    const { username } = await params

    // Find the user first
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { id: username }],
      },
      select: {
        id: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch user's projects
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
        published: true,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Add isStarred and userVibes fields
    const projectsWithStarStatus = projects.map((project) => ({
      ...project,
      isStarred: userId ? project.stars.length > 0 : false,
      userVibes: userId ? project.vibes.map((v: any) => v.type) : [],
      stars: undefined,
      vibes: undefined,
    }))

    return NextResponse.json({ projects: projectsWithStarStatus })
  } catch (error) {
    console.error("Error fetching user projects:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
