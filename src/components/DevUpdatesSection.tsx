"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Megaphone,
  Plus,
  Sparkles,
  Bug,
  Rocket,
  Bell,
  Trash2,
  Edit3,
  Calendar,
} from "lucide-react"

interface DevUpdate {
  id: string
  title: string
  content: string
  type: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

interface DevUpdatesSectionProps {
  projectId: string
  projectOwnerId: string
}

export function DevUpdatesSection({
  projectId,
  projectOwnerId,
}: DevUpdatesSectionProps) {
  const { user } = useUser()
  const [updates, setUpdates] = useState<DevUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "update",
  })
  const [submitting, setSubmitting] = useState(false)

  const isOwner = user?.id === projectOwnerId

  useEffect(() => {
    fetchUpdates()
  }, [projectId])

  const fetchUpdates = async () => {
    try {
      const response = await fetch(`/api/dev-updates?projectId=${projectId}`)
      const data = await response.json()
      setUpdates(data.updates || [])
    } catch (error) {
      console.error("Error fetching dev updates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/dev-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, projectId }),
      })

      if (response.ok) {
        const data = await response.json()
        setUpdates([data.update, ...updates])
        setFormData({ title: "", content: "", type: "update" })
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error posting update:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (updateId: string) => {
    try {
      const response = await fetch(`/api/dev-updates?id=${updateId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUpdates(updates.filter((u) => u.id !== updateId))
      }
    } catch (error) {
      console.error("Error deleting update:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Sparkles className="w-5 h-5" />
      case "bugfix":
        return <Bug className="w-5 h-5" />
      case "announcement":
        return <Bell className="w-5 h-5" />
      default:
        return <Rocket className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "from-blue-500 to-cyan-500"
      case "bugfix":
        return "from-orange-500 to-red-500"
      case "announcement":
        return "from-purple-500 to-pink-500"
      default:
        return "from-green-500 to-teal-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "New Feature"
      case "bugfix":
        return "Bug Fix"
      case "announcement":
        return "Announcement"
      default:
        return "Update"
    }
  }

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dev Updates</h2>
            <p className="text-sm text-gray-600">
              {updates.length} update{updates.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isOwner && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Update
          </Button>
        )}
      </div>

      {/* Update Form */}
      <AnimatePresence>
        {showForm && isOwner && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-green-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["update", "feature", "bugfix", "announcement"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.type === type
                          ? "border-green-500 bg-green-50 text-green-900"
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {getTypeIcon(type)}
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="What's new?"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Tell the community about this update..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none resize-none text-gray-900 placeholder:text-gray-500"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.title.trim() || !formData.content.trim() || submitting
                  }
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {submitting ? "Posting..." : "Post Update"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Updates List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/50 rounded-xl p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">No updates yet. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${getTypeColor(
                      update.type
                    )} rounded-lg flex items-center justify-center text-white`}
                  >
                    {getTypeIcon(update.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                        {getTypeLabel(update.type)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">
                      {update.title}
                    </h3>
                  </div>
                </div>

                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(update.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed ml-13">
                {update.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
