"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { ProjectCard } from "@/components/ProjectCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, TrendingUp, Clock, Search, Filter } from "lucide-react"

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

export default function ProjectsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent")
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchProjects(true)
  }, [sortBy, selectedTag])

  const fetchProjects = async (reset = false) => {
    if (!reset && !hasMore) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "12",
        sort: sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTag && { tag: selectedTag }),
      })

      const response = await fetch(`/api/projects?${params}`)
      const data = await response.json()

      if (reset) {
        setProjects(data.projects || [])
        setPage(2)
      } else {
        setProjects(prev => [...prev, ...(data.projects || [])])
        setPage(prev => prev + 1)
      }

      setTotalCount(data.pagination?.total || 0)
      setHasMore((data.projects?.length || 0) === 12)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchProjects(true)
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

  const popularTags = ["web-app", "mobile", "ai", "game", "tool", "api", "ui-library", "data-viz"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Projects
        </h1>
        <p className="text-gray-600">
          Discover amazing projects from the community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 text-slate-900 bg-white border-slate-300"
              />
            </div>
          </div>

          {/* Sort Options */}
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

        {/* Tag Filters */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Popular Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag("")}
            >
              All
            </Button>
            {popularTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {totalCount > 0 && (
            <span>
              Showing {projects.length} of {totalCount} projects
              {searchTerm && ` for "${searchTerm}"`}
              {selectedTag && ` tagged with "${selectedTag}"`}
            </span>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
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
        <>
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

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button
                onClick={() => fetchProjects(false)}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                {loading ? "Loading..." : "Load More Projects"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedTag
              ? "Try adjusting your search criteria"
              : "Be the first to share a project!"}
          </p>
          {searchTerm || selectedTag ? (
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedTag("")
                fetchProjects(true)
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}