"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Upload, Github, ExternalLink, Sparkles, Zap, Rocket, Twitter, Linkedin, Youtube, Globe } from "lucide-react"

export default function SubmitProject() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [techStack, setTechStack] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [currentTech, setCurrentTech] = useState("")
  const [currentTag, setCurrentTag] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    demoUrl: "",
    githubUrl: "",
    imageUrl: "",
    twitterUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    websiteUrl: "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageError, setImageError] = useState<string>("")
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("upload")

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in with GitHub to submit your project.
          </p>
          <Button onClick={() => router.push("/api/auth/signin")}>
            <Github className="w-4 h-4 mr-2" />
            Sign In with GitHub
          </Button>
        </div>
      </div>
    )
  }

  const addTech = () => {
    if (currentTech.trim() && !techStack.includes(currentTech.trim())) {
      setTechStack([...techStack, currentTech.trim()])
      setCurrentTech("")
    }
  }

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech))
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url })
    setImageError("")

    if (url.trim()) {
      // Basic URL validation
      try {
        new URL(url)
        setImagePreview(url)
      } catch {
        setImageError("Please enter a valid URL")
        setImagePreview("")
      }
    } else {
      setImagePreview("")
    }
  }

  const handleImageError = () => {
    setImageError("Failed to load image. Please check the URL.")
    setImagePreview("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be less than 5MB")
      return
    }

    setImageError("")

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData({ ...formData, imageUrl: base64String })
      setImagePreview(base64String)
    }
    reader.onerror = () => {
      setImageError("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description are required")
      return
    }

    // Check if at least one link is provided (project or social)
    const hasAnyLink = formData.demoUrl.trim() ||
                       formData.githubUrl.trim() ||
                       formData.twitterUrl.trim() ||
                       formData.linkedinUrl.trim() ||
                       formData.youtubeUrl.trim() ||
                       formData.websiteUrl.trim()

    if (!hasAnyLink) {
      alert("Please add at least one link (demo, GitHub, or social) so people can find you or your project!")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          techStack: techStack.length > 0 ? techStack : null,
          tags: tags.length > 0 ? tags : null,
        }),
      })

      if (response.ok) {
        const project = await response.json()
        router.push(`/project/${project.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit project")
      }
    } catch (error) {
      console.error("Error submitting project:", error)
      alert("Failed to submit project")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-teal-700">
              <Sparkles className="w-4 h-4" />
              Share your creation
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-playfair aurora-text mb-4">
            Submit Your Vibe
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Share your project with the community and get some vibes!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Zap className="w-4 h-4 text-teal-600" />
              Project Title *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Enter your amazing project title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 text-lg px-4 py-6 rounded-xl placeholder:text-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Describe your project, what it does, and what makes it special..."
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 text-base px-4 py-4 rounded-xl placeholder:text-gray-400 resize-none"
              required
            />
          </div>

          {/* Project URLs Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-teal-600" />
              Project Links
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Live Demo URL */}
              <div className="space-y-3">
                <label htmlFor="demoUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <ExternalLink className="w-4 h-4 text-teal-600" />
                  Where Your Vibe Lives
                </label>
                <div className="relative">
                  <Rocket className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="demoUrl"
                    type="url"
                    placeholder="https://your-vibe.vercel.app"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    className="pl-12 text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-600">Your deployed URL (Vercel, Netlify, custom domain, etc.)</p>
              </div>

              {/* GitHub URL */}
              <div className="space-y-3">
                <label htmlFor="githubUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Github className="w-4 h-4 text-teal-600" />
                  GitHub Repository
                </label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="pl-12 text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-600">Public or private - totally up to you!</p>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Your Social Links
            </h3>
            <p className="text-sm text-gray-600 -mt-2">
              Help people connect with you! (At least one link required - can be project or social)
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Twitter/X */}
              <div className="space-y-3">
                <label htmlFor="twitterUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Twitter className="w-4 h-4 text-teal-600" />
                  Twitter / X
                </label>
                <div className="relative">
                  <Twitter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="twitterUrl"
                    type="url"
                    placeholder="https://twitter.com/username"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="pl-12 text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-3">
                <label htmlFor="linkedinUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Linkedin className="w-4 h-4 text-teal-600" />
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="pl-12 text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="space-y-3">
                <label htmlFor="youtubeUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Youtube className="w-4 h-4 text-teal-600" />
                  YouTube
                </label>
                <div className="relative">
                  <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://youtube.com/@channel"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="pl-12 text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Personal Website */}
              <div className="space-y-3">
                <label htmlFor="websiteUrl" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Globe className="w-4 h-4 text-teal-600" />
                  Personal Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="pl-12 text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload/URL */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Upload className="w-4 h-4 text-teal-600" />
                Project Screenshot/Image
              </label>
              <div className="flex gap-2 bg-white/80 p-1 rounded-lg border-2 border-teal-200">
                <button
                  type="button"
                  onClick={() => setUploadMode("upload")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    uploadMode === "upload"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    uploadMode === "url"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {uploadMode === "upload" ? (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-teal-300 rounded-xl cursor-pointer bg-white/60 hover:bg-white/80 transition-all group"
                  >
                    <Upload className="w-12 h-12 text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
                {imageError && (
                  <p className="text-sm text-red-600 font-medium">{imageError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://i.imgur.com/example.png"
                    value={formData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className={`pl-12 text-slate-900 bg-white/80 border-2 ${imageError ? 'border-red-400' : 'border-teal-200'} focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400`}
                  />
                </div>
                {imageError && (
                  <p className="text-sm text-red-600 font-medium">{imageError}</p>
                )}
                <p className="text-sm text-gray-600">
                  💡 Upload to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-medium">Imgur</a> or use a GitHub raw URL
                </p>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && !imageError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <p className="text-sm font-semibold text-gray-800 mb-3">Preview:</p>
                <div className="border-2 border-teal-200 rounded-2xl overflow-hidden bg-white shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Project preview"
                    className="w-full h-64 object-cover"
                    onError={handleImageError}
                    onLoad={() => setImageError("")}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Tech Stack & Tags */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tech Stack */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Zap className="w-4 h-4 text-teal-600" />
                Tech Stack
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React, TypeScript, Tailwind"
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  className="text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                />
                <Button
                  type="button"
                  onClick={addTech}
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 px-6"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {techStack.map((tech) => (
                    <motion.span
                      key={tech}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 text-sm font-medium rounded-full border-2 border-teal-200"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. web-app, ai, productivity"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="text-slate-900 bg-white/80 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 px-4 py-5 rounded-xl placeholder:text-gray-400"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 px-6"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 text-sm font-medium rounded-full border-2 border-cyan-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-cyan-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            className="pt-8"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600 text-white font-bold text-lg py-7 rounded-xl shadow-2xl hover:shadow-teal-500/50 transition-all duration-300"
              size="lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Submit Project & Get Vibes
                  <Sparkles className="w-5 h-5" />
                </span>
              )}
            </Button>
          </motion.div>
        </form>
        </motion.div>
      </div>
    </div>
  )
}