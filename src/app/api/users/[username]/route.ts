import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Try to find user by username first, then by ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { id: username }],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        githubUrl: true,
        websiteUrl: true,
        twitterUrl: true,
        linkedinUrl: true,
        youtubeUrl: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            stars: true,
            vibes: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get vibe breakdown by type
    const vibesByType = await prisma.vibe.groupBy({
      by: ["type"],
      where: {
        project: {
          userId: user.id,
        },
      },
      _count: {
        type: true,
      },
    })

    const vibes = {
      fire: 0,
      sparkle: 0,
      rocket: 0,
      inspired: 0,
      "mind-blown": 0,
    }

    vibesByType.forEach((vibe) => {
      if (vibe.type in vibes) {
        vibes[vibe.type as keyof typeof vibes] = vibe._count.type
      }
    })

    return NextResponse.json({
      user: {
        ...user,
        vibes,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
