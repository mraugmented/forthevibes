"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, ExternalLink, Github, Calendar, User, ArrowLeft } from "lucide-react"

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

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStarring, setIsStarring] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else if (response.status === 404) {
        router.push("/404")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStar = async () => {
    if (!session?.user?.id || !project || isStarring) return

    setIsStarring(true)
    try {
      const method = project.isStarred ? "DELETE" : "POST"
      const response = await fetch(`/api/projects/${project.id}/star`, {
        method,
      })

      if (response.ok) {
        const data = await response.json()
        setProject(prev => prev ? {
          ...prev,
          isStarred: data.isStarred,
          _count: { ...prev._count, stars: data.starCount }
        } : null)
      }
    } catch (error) {
      console.error("Failed to star project:", error)
    } finally {
      setIsStarring(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Project not found
          </h1>
          <p className="text-gray-600 mb-8">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/projects">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const tags = project.tags ? JSON.parse(project.tags) : []
  const techStack = project.techStack ? JSON.parse(project.techStack) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          {project.imageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {project.title}
                </h1>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    {project.user.image ? (
                      <img
                        src={project.user.image}
                        alt={project.user.name || ""}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <Link
                      href={`/profile/${project.user.username || project.user.id}`}
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      {project.user.name || project.user.username}
                    </Link>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Tech Stack */}
                {techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 lg:min-w-[200px]">
                {session?.user?.id && (
                  <Button
                    onClick={handleStar}
                    disabled={isStarring}
                    variant={project.isStarred ? "default" : "outline"}
                    className={`${
                      project.isStarred
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 mr-2 ${
                        project.isStarred ? "fill-current" : ""
                      }`}
                    />
                    {project.isStarred ? "Starred" : "Star"} ({project._count.stars})
                  </Button>
                )}

                {!session?.user?.id && (
                  <div className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md">
                    <Star className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">{project._count.stars} stars</span>
                  </div>
                )}

                {project.demoUrl && (
                  <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="default">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Demo
                    </Button>
                  </Link>
                )}

                {project.githubUrl && (
                  <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="outline">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects or Additional Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            More from {project.user.name || project.user.username}
          </h2>
          <p className="text-gray-600">
            Check out more projects from this developer on their{" "}
            <Link
              href={`/profile/${project.user.username || project.user.id}`}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              profile page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}