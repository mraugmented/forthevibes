"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, TrendingUp, Clock, Search, Plus } from "lucide-react"

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

export default function Home() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    fetchProjects()
  }, [sortBy])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        limit: "8",
        sort: sortBy,
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProjects()
  }

  const handleStar = async (projectId: string, isStarred: boolean) => {
    if (!session?.user?.id) return

    const method = isStarred ? "DELETE" : "POST"
    const response = await fetch(`/api/projects/${projectId}/star`, {
      method,
    })

    if (!response.ok) {
      throw new Error("Failed to update star")
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Showcase Your
              <br />
              Vibecoded Projects
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A community platform where developers share their creative projects
              and receive recognition through a star-based voting system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/submit">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8">
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Your Project
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8">
                  <Star className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              )}
              <Link href="/projects">
                <Button variant="outline" size="lg" className="px-8">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recent")}
              >
                <Clock className="w-4 h-4 mr-1" />
                Recent
              </Button>
              <Button
                variant={sortBy === "trending" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("trending")}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </Button>
              <Button
                variant={sortBy === "stars" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("stars")}
              >
                <Star className="w-4 h-4 mr-1" />
                Top Rated
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUserId={session?.user?.id}
                  onStar={handleStar}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to share your vibecoded project!
              </p>
              {session && (
                <Link href="/submit">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Project
                  </Button>
                </Link>
              )}
            </div>
          )}

          {projects.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/projects">
                <Button variant="outline" size="lg">
                  View All Projects
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Join the Vibecode Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {projects.length}
              </div>
              <p className="text-gray-600">Projects Showcased</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {projects.reduce((acc, p) => acc + p._count.stars, 0)}
              </div>
              <p className="text-gray-600">Stars Given</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {new Set(projects.map(p => p.user.id)).size}
              </div>
              <p className="text-gray-600">Active Developers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
