"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { motion } from "framer-motion"
import { ProjectCardNew } from "@/components/ProjectCardNew"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Star,
  TrendingUp,
  Clock,
  Search,
  Plus,
  Sparkles,
  Users,
  Zap,
  ArrowRight,
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

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    fetchProjects()
  }, [sortBy])

  useEffect(() => {
    if (searchTerm === "") {
      fetchProjects()
    }
  }, [searchTerm])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        limit: "12",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Aurora Effect */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-purple-700">
                <Sparkles className="w-4 h-4" />
                Where creativity meets community
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold font-playfair mb-6 aurora-text">
              ForTheVibes
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Share your creative projects with a vibrant community of developers.
              Get inspired, give vibes, and grow together.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {isSignedIn ? (
                <Button
                  size="lg"
                  asChild
                  className="px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  <Link href="/submit">
                    <Plus className="w-5 h-5 mr-2" />
                    Share Your Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                asChild
                className="glass px-10 py-6 text-lg hover:bg-white/90"
              >
                <Link href="/projects">
                  Explore Projects
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="container mx-auto glass rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {projects.length}+
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Projects
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {projects.reduce((acc, p) => acc + (p._count.vibes || 0), 0)}+
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Vibes Given
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {new Set(projects.map((p) => p.user.id)).size}+
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Creators
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {projects.reduce((acc, p) => acc + (p._count.comments || 0), 0)}+
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                Comments
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 max-w-md w-full"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search amazing projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 pr-4 py-6 glass border-2 border-teal-200 focus:border-teal-400 text-lg text-slate-900"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="px-6"
                >
                  Search
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="lg"
                onClick={() => setSortBy("recent")}
                className={sortBy === "recent" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white" : "glass text-slate-700"}
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={sortBy === "trending" ? "default" : "outline"}
                size="lg"
                onClick={() => setSortBy("trending")}
                className={sortBy === "trending" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white" : "glass text-slate-700"}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </Button>
              <Button
                variant={sortBy === "stars" ? "default" : "outline"}
                size="lg"
                onClick={() => setSortBy("stars")}
                className={sortBy === "stars" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white" : "glass text-slate-700"}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Top Vibes
              </Button>
            </motion.div>
          </div>

          {/* Bento Grid Projects */}
          {loading ? (
            <div className="bento-grid">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bento-item glass animate-pulse"
                >
                  <div className="h-48 bg-gray-200/50 rounded-t-xl mb-4"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200/50 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200/50 rounded"></div>
                    <div className="h-4 bg-gray-200/50 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="bento-grid"
            >
              {projects.map((project) => (
                <ProjectCardNew
                  key={project.id}
                  project={project}
                  currentUserId={user?.id}
                  size="small"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 glass rounded-2xl"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No projects found
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Be the first to share your project and get some vibes!
              </p>
              {isSignedIn && (
                <Button
                  size="lg"
                  asChild
                  className="shadow-lg"
                >
                  <Link href="/submit">
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Your Project
                  </Link>
                </Button>
              )}
            </motion.div>
          )}

          {projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-16"
            >
              <Button
                variant="outline"
                size="lg"
                asChild
                className="glass px-10 py-6 text-lg hover:bg-white/90"
              >
                <Link href="/projects">
                  View All Projects
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-6">
                Join the ForTheVibes Community
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Connect with creative developers, share your work, and give vibes to
                projects that inspire you.
              </p>
              <Button
                size="lg"
                className="px-10 py-6 text-lg shadow-xl"
              >
                <Users className="w-5 h-5 mr-2" />
                Start Creating Today
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
