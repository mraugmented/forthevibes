"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, Github, Calendar, Eye, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VibeButtonEnhanced } from "@/components/VibeButtonEnhanced"
import { useState } from "react"

interface ProjectCardNewProps {
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
    views?: number
    vibeScore?: number
    user: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
    _count: {
      stars: number
      vibes?: number
      comments?: number
    }
    isStarred?: boolean
    userVibes?: string[]
  }
  currentUserId?: string | null
  size?: "small" | "medium" | "large"
}

export function ProjectCardNew({
  project,
  currentUserId,
  size = "medium",
}: ProjectCardNewProps) {
  const [imageError, setImageError] = useState(false)
  const tags = project.tags ? JSON.parse(project.tags) : []
  const techStack = project.techStack ? JSON.parse(project.techStack) : []

  const vibesByType = {
    fire: 0,
    sparkle: 0,
    rocket: 0,
    inspired: 0,
    "mind-blown": 0,
  }

  const sizeClasses = {
    small: "",
    medium: "md:col-span-2",
    large: "md:col-span-2 lg:col-span-3",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`bento-item glass group ${sizeClasses[size]}`}
    >
      <Link href={`/project/${project.id}`} className="block h-full">
        {project.imageUrl && !imageError && (
          <div className={`relative w-full overflow-hidden ${size === "large" ? "h-80" : "h-48"}`}>
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
              src={project.imageUrl}
              alt={project.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`font-bold text-gray-900 line-clamp-2 ${size === "large" ? "text-3xl font-playfair" : "text-xl"}`}>
              {project.title}
            </h3>
            <VibeButtonEnhanced
              projectId={project.id}
              currentUserId={currentUserId}
              initialVibes={vibesByType}
              userVibes={project.userVibes || []}
            />
          </div>

          <p className={`text-gray-600 ${size === "large" ? "line-clamp-4 text-lg" : "line-clamp-2 text-sm"}`}>
            {project.description}
          </p>

          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techStack.slice(0, size === "large" ? 8 : 4).map((tech: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/80 backdrop-blur-sm text-teal-700 text-xs font-medium rounded-full border border-teal-200"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > (size === "large" ? 8 : 4) && (
                <span className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-600 text-xs rounded-full">
                  +{techStack.length - (size === "large" ? 8 : 4)}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/50">
            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${project.user.username || project.user.id}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {project.user.image ? (
                  <img
                    src={project.user.image}
                    alt={project.user.name || ""}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full border-2 border-white" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {project.user.name || project.user.username}
                </span>
              </Link>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                {project.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {project.views}
                  </span>
                )}
                {project._count.comments !== undefined && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {project._count.comments}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {project.demoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-3 h-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
