import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [totalUsers, totalProjects, totalVibes, totalComments] =
      await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.vibe.count(),
        prisma.comment.count(),
      ])

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { projects: { some: { createdAt: { gte: sevenDaysAgo } } } },
          { vibes: { some: { createdAt: { gte: sevenDaysAgo } } } },
          { comments: { some: { createdAt: { gte: sevenDaysAgo } } } },
        ],
      },
    })

    const dailyStats = await prisma.analytics.findMany({
      orderBy: { date: "desc" },
      take: 30,
    })

    return NextResponse.json({
      current: {
        totalUsers,
        totalProjects,
        totalVibes,
        totalComments,
        activeUsers,
      },
      history: dailyStats,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const [totalUsers, totalProjects, totalVibes, totalComments] =
      await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.vibe.count(),
        prisma.comment.count(),
      ])

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { projects: { some: { createdAt: { gte: sevenDaysAgo } } } },
          { vibes: { some: { createdAt: { gte: sevenDaysAgo } } } },
          { comments: { some: { createdAt: { gte: sevenDaysAgo } } } },
        ],
      },
    })

    const analytics = await prisma.analytics.create({
      data: {
        totalUsers,
        totalProjects,
        totalVibes,
        totalComments,
        activeUsers,
      },
    })

    return NextResponse.json({ analytics })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create analytics snapshot" },
      { status: 500 }
    )
  }
}
