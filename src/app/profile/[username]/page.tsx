"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { VibeStats } from "@/components/VibeStats"
import { AchievementBadge } from "@/components/AchievementBadge"
import { Github, ExternalLink, Calendar, Star, Users, Code, Trophy, Flame, Heart, Zap, Sparkles } from "lucide-react"

interface User {
  id: string
  name: string | null
  username: string | null
  email: string | null
  image: string | null
  bio: string | null
  githubUrl: string | null
  websiteUrl: string | null
  createdAt: Date
  _count: {
    projects: number
    stars: number
    vibes?: number
  }
  vibes?: {
    fire: number
    sparkle: number
    rocket: number
    inspired: number
    "mind-blown": number
  }
}

interface Project {
  id: string
  title: string
  description: string
  demoUrl?: string | null
  githubUrl?: string | null
  imageUrl?: string | null
  tags?: string | null
  techStack?: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  _count: {
    stars: number
  }
  isStarred?: boolean
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: currentUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchUserData()
  }, [params.username])

  const fetchUserData = async () => {
    try {
      // For now, we'll create a mock implementation since we haven't created the API endpoints yet
      // In a real implementation, you would fetch from /api/users/[username]

      // Mock user data - replace with actual API call
      const mockUser: User = {
        id: "1",
        name: "Demo User",
        username: params.username,
        email: "demo@example.com",
        image: "https://github.com/octocat.png",
        bio: "Passionate developer building amazing projects for the vibes!",
        githubUrl: `https://github.com/${params.username}`,
        websiteUrl: "https://example.com",
        createdAt: new Date("2024-01-01"),
        _count: {
          projects: 5,
          stars: 23,
          vibes: 127
        },
        vibes: {
          fire: 32,
          sparkle: 28,
          rocket: 24,
          inspired: 26,
          "mind-blown": 17
        }
      }

      // Mock projects - replace with actual API call
      const mockProjects: Project[] = []

      setUser(mockUser)
      setProjects(mockProjects)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStar = async (projectId: string, isStarred: boolean) => {
    if (!currentUser?.id) return

    const method = isStarred ? "DELETE" : "POST"
    const response = await fetch(`/api/projects/${projectId}/star`, {
      method,
    })

    if (!response.ok) {
      throw new Error("Failed to update star")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User not found
          </h1>
          <p className="text-gray-600">
            The user @{params.username} doesn't exist or hasn't been found.
          </p>
        </div>
      </div>
    )
  }

  // Calculate achievements
  const totalVibes = user.vibes ? Object.values(user.vibes).reduce((sum, count) => sum + count, 0) : 0

  const achievements = [
    {
      icon: Flame,
      title: "First Fire",
      description: "Received your first fire vibe",
      color: "#FF6B5B",
      gradient: "from-orange-400 to-red-500",
      unlocked: (user.vibes?.fire || 0) > 0,
    },
    {
      icon: Sparkles,
      title: "Sparkle Master",
      description: "Received 10+ sparkle vibes",
      color: "#FFC107",
      gradient: "from-yellow-400 to-amber-500",
      unlocked: (user.vibes?.sparkle || 0) >= 10,
    },
    {
      icon: Zap,
      title: "Mind Blower",
      description: "Received 5+ mind-blown vibes",
      color: "#FB7185",
      gradient: "from-rose-400 to-pink-500",
      unlocked: (user.vibes?.["mind-blown"] || 0) >= 5,
    },
    {
      icon: Trophy,
      title: "Vibe Legend",
      description: "Received 100+ total vibes",
      color: "#14B8A6",
      gradient: "from-teal-400 to-emerald-500",
      unlocked: totalVibes >= 100,
    },
    {
      icon: Heart,
      title: "Community Favorite",
      description: "Received 50+ total vibes",
      color: "#FB7185",
      gradient: "from-rose-400 to-pink-500",
      unlocked: totalVibes >= 50,
    },
    {
      icon: Code,
      title: "Prolific Creator",
      description: "Published 5+ projects",
      color: "#0EA5E9",
      gradient: "from-blue-400 to-cyan-500",
      unlocked: user._count.projects >= 5,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-400">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.username || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-1">
                {user.name || user.username}
              </h1>
              {user.username && user.name !== user.username && (
                <p className="text-slate-600 mb-2">@{user.username}</p>
              )}
              {user.bio && (
                <p className="text-slate-700 mb-4">{user.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Code className="w-4 h-4 mr-1" />
                  {user._count.projects} projects
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-teal-500" />
                  {totalVibes} vibes received
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 glass hover:bg-white/80 text-slate-700 text-sm rounded-full transition-colors"
                  >
                    <Github className="w-4 h-4 mr-1" />
                    GitHub
                  </a>
                )}
                {user.websiteUrl && (
                  <a
                    href={user.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 glass hover:bg-white/80 text-slate-700 text-sm rounded-full transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6 border-b-2 border-teal-100 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "overview"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "projects"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Projects ({user._count.projects})
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "achievements"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {user.vibes && (
              <VibeStats vibes={user.vibes} totalVibes={totalVibes} />
            )}

            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Top Achievements</h2>
              <div className="space-y-3">
                {achievements
                  .filter(a => a.unlocked)
                  .slice(0, 3)
                  .map((achievement, index) => (
                    <AchievementBadge key={index} {...achievement} />
                  ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No achievements unlocked yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    currentUserId={currentUser?.id}
                    onStar={handleStar}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600">
                  {currentUser?.id === user.id
                    ? "You haven't submitted any projects yet."
                    : `${user.name || user.username} hasn't submitted any projects yet.`}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <AchievementBadge key={index} {...achievement} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}