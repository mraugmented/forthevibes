import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
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

    const vibe = await prisma.vibe.create({
      data: {
        type,
        userId: session.user.id,
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, type } = await req.json()

    const vibe = await prisma.vibe.delete({
      where: {
        userId_projectId_type: {
          userId: session.user.id,
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
