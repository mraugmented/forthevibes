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

    const comments = await prisma.comment.findMany({
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

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
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

    const { projectId, content } = await req.json()

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Missing projectId or content" },
        { status: 400 }
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

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: userId,
        projectId,
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

    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
