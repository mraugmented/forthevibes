import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check if user already starred this project
    const existingStar = await prisma.star.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    })

    if (existingStar) {
      return NextResponse.json(
        { error: "Project already starred" },
        { status: 400 }
      )
    }

    // Create star
    await prisma.star.create({
      data: {
        userId: session.user.id,
        projectId,
      },
    })

    // Get updated star count
    const starCount = await prisma.star.count({
      where: { projectId },
    })

    return NextResponse.json({
      message: "Project starred successfully",
      starCount,
      isStarred: true,
    })
  } catch (error) {
    console.error("Error starring project:", error)
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Find and delete the star
    const existingStar = await prisma.star.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    })

    if (!existingStar) {
      return NextResponse.json(
        { error: "Project not starred" },
        { status: 400 }
      )
    }

    await prisma.star.delete({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    })

    // Get updated star count
    const starCount = await prisma.star.count({
      where: { projectId },
    })

    return NextResponse.json({
      message: "Project unstarred successfully",
      starCount,
      isStarred: false,
    })
  } catch (error) {
    console.error("Error unstarring project:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}