import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id: projectId } = await params

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        published: true
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
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Add isStarred and userVibes fields
    const projectWithStarStatus = {
      ...project,
      isStarred: userId ? project.stars.length > 0 : false,
      userVibes: userId ? project.vibes.map((v: any) => v.type) : [],
      stars: undefined, // Remove the stars array from response
      vibes: undefined, // Remove the vibes array from response
    }

    return NextResponse.json(projectWithStarStatus)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()

    if (body.action === "incrementViews") {
      await prisma.project.update({
        where: { id: projectId },
        data: { views: { increment: 1 } },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: projectId } = await params
    const body = await request.json()

    // Check if user owns the project
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (existingProject.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const {
      title,
      description,
      demoUrl,
      githubUrl,
      imageUrl,
      tags,
      techStack,
    } = body

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        demoUrl: demoUrl || null,
        githubUrl: githubUrl || null,
        imageUrl: imageUrl || null,
        tags: tags ? JSON.stringify(tags) : null,
        techStack: techStack ? JSON.stringify(techStack) : null,
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

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Check if user owns the project
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (existingProject.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}