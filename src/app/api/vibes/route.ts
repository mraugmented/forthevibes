import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, type } = await req.json()

    if (!projectId || !type) {
      return NextResponse.json(
        { error: "Missing projectId or type" },
        { status: 400 }
      )
    }

    const validTypes = ["fire", "sparkle", "rocket", "inspired", "mind-blown"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid vibe type" }, { status: 400 })
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

    const vibe = await prisma.vibe.create({
      data: {
        type,
        userId: userId,
        projectId,
      },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { vibeScore: { increment: 1 } },
    })

    return NextResponse.json({ vibe })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Already gave this vibe" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Failed to add vibe" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, type } = await req.json()

    const vibe = await prisma.vibe.delete({
      where: {
        userId_projectId_type: {
          userId: userId,
          projectId,
          type,
        },
      },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { vibeScore: { decrement: 1 } },
    })

    return NextResponse.json({ vibe })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove vibe" },
      { status: 500 }
    )
  }
}
