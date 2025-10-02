"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VibeButtonEnhanced } from "@/components/VibeButtonEnhanced"
import { CommentsSection } from "@/components/CommentsSection"
import { DevUpdatesSection } from "@/components/DevUpdatesSection"
import {
  ExternalLink,
  Github,
  Calendar,
  User,
  ArrowLeft,
  Eye,
  Share2,
} from "lucide-react"

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

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"feedback" | "updates">("feedback")

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)

        // Increment view count
        fetch(`/api/projects/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "incrementViews" }),
        })
      } else if (response.status === 404) {
        router.push("/404")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200/50 rounded w-1/4"></div>
          <div className="glass rounded-2xl p-8">
            <div className="h-96 bg-gray-200/50 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200/50 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200/50 rounded mb-2"></div>
            <div className="h-4 bg-gray-200/50 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="glass rounded-2xl p-12 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Project not found
          </h1>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/projects">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600">
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
  const vibesByType = {
    fire: 0,
    sparkle: 0,
    rocket: 0,
    inspired: 0,
    "mind-blown": 0,
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="glass hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl overflow-hidden"
            >
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
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h1 className="text-4xl font-bold font-playfair text-gray-900">
                    {project.title}
                  </h1>
                  <VibeButtonEnhanced
                    projectId={project.id}
                    currentUserId={session?.user?.id}
                    initialVibes={vibesByType}
                    userVibes={project.userVibes || []}
                  />
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  {project.views !== undefined && (
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {project.views} views
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Tech Stack */}
                {techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      Built With
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-white/80 backdrop-blur-sm text-teal-700 text-sm font-medium rounded-full border border-teal-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabs for Feedback & Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === "feedback"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "glass text-gray-700 hover:bg-white/80"
                  }`}
                >
                  Community Feedback
                </button>
                <button
                  onClick={() => setActiveTab("updates")}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === "updates"
                      ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg"
                      : "glass text-gray-700 hover:bg-white/80"
                  }`}
                >
                  Dev Updates
                </button>
              </div>

              {activeTab === "feedback" ? (
                <CommentsSection projectId={project.id} />
              ) : (
                <DevUpdatesSection
                  projectId={project.id}
                  projectOwnerId={project.user.id}
                />
              )}
            </motion.div>
          </div>

          {/* Sidebar - Right Side (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Creator Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Created By
              </h3>
              <Link
                href={`/profile/${project.user.username || project.user.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {project.user.image ? (
                  <img
                    src={project.user.image}
                    alt={project.user.name || ""}
                    className="w-12 h-12 rounded-full border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {project.user.name || project.user.username}
                  </p>
                  <p className="text-xs text-gray-600">View profile →</p>
                </div>
              </Link>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 space-y-3"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Quick Actions
              </h3>

              {project.demoUrl && (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Demo
                  </a>
                </Button>
              )}

              {project.githubUrl && (
                <Button asChild variant="outline" className="w-full glass">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Source Code
                  </a>
                </Button>
              )}

              <Button variant="outline" className="w-full glass">
                <Share2 className="w-4 h-4 mr-2" />
                Share Project
              </Button>
            </motion.div>

            {/* Project Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Engagement
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Vibes</span>
                  <span className="font-bold text-lg text-purple-600">
                    {project._count.vibes || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-bold text-lg text-purple-600">
                    {project._count.comments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-bold text-lg text-purple-600">
                    {project.views || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
