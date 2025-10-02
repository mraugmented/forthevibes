import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      )
    }

    const updates = await prisma.devUpdate.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ updates })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dev updates" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, title, content, type } = await req.json()

    if (!projectId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify user owns the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (!project || project.userId !== userId) {
      return NextResponse.json(
        { error: "You can only add updates to your own projects" },
        { status: 403 }
      )
    }

    // Ensure user exists with Clerk data
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

    await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: clerkUser.fullName || clerkUser.username || null,
        username: clerkUser.username || null,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        image: clerkUser.imageUrl || null,
      },
      create: {
        id: userId,
        name: clerkUser.fullName || clerkUser.username || null,
        username: clerkUser.username || null,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        image: clerkUser.imageUrl || null,
      },
    })

    const update = await prisma.devUpdate.create({
      data: {
        title,
        content,
        type: type || "update",
        projectId,
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
      },
    })

    return NextResponse.json({ update })
  } catch (error) {
    console.error("Error creating dev update:", error)
    return NextResponse.json(
      { error: "Failed to create dev update" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const updateId = searchParams.get("id")

    if (!updateId) {
      return NextResponse.json(
        { error: "Missing update id" },
        { status: 400 }
      )
    }

    // Verify user owns the update
    const update = await prisma.devUpdate.findUnique({
      where: { id: updateId },
      select: { userId: true },
    })

    if (!update || update.userId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own updates" },
        { status: 403 }
      )
    }

    await prisma.devUpdate.delete({
      where: { id: updateId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete dev update" },
      { status: 500 }
    )
  }
}
