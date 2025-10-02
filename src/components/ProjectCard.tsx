"use client"

import Link from "next/link"
import { Star, ExternalLink, Github, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ProjectCardProps {
  project: {
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
  currentUserId?: string | null
  onStar?: (projectId: string, isStarred: boolean) => Promise<void>
}

export function ProjectCard({ project, currentUserId, onStar }: ProjectCardProps) {
  const [isStarring, setIsStarring] = useState(false)
  const [starCount, setStarCount] = useState(project._count.stars)
  const [isStarred, setIsStarred] = useState(project.isStarred || false)

  const handleStar = async () => {
    if (!currentUserId || !onStar || isStarring) return

    setIsStarring(true)
    try {
      await onStar(project.id, !isStarred)
      setIsStarred(!isStarred)
      setStarCount(isStarred ? starCount - 1 : starCount + 1)
    } catch (error) {
      console.error("Failed to star project:", error)
    } finally {
      setIsStarring(false)
    }
  }

  const tags = project.tags ? JSON.parse(project.tags) : []
  const techStack = project.techStack ? JSON.parse(project.techStack) : []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {project.imageUrl && (
        <Link href={`/project/${project.id}`} className="block aspect-video w-full overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/project/${project.id}`} className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 hover:text-teal-600 transition-colors">
              {project.title}
            </h3>
          </Link>
          <div className="flex items-center space-x-2 ml-4">
            {currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStar}
                disabled={isStarring}
                className={`${
                  isStarred
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-gray-400 hover:text-yellow-500"
                }`}
              >
                <Star
                  className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`}
                />
                <span className="ml-1 text-sm">{starCount}</span>
              </Button>
            )}
            {!currentUserId && (
              <div className="flex items-center text-gray-500">
                <Star className="w-4 h-4" />
                <span className="ml-1 text-sm">{starCount}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {techStack.slice(0, 4).map((tech: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{techStack.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {project.user.image ? (
                <img
                  src={project.user.image}
                  alt={project.user.name || ""}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full" />
              )}
              <Link
                href={`/profile/${project.user.username || project.user.id}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {project.user.name || project.user.username}
              </Link>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {project.demoUrl && (
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Demo
                </Button>
              </Link>
            )}
            {project.githubUrl && (
              <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Github className="w-3 h-3 mr-1" />
                  Code
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}