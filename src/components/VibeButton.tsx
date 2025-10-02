"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Sparkles, Rocket, Lightbulb, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VibeButtonProps {
  projectId: string
  currentUserId?: string | null
  initialVibes: { [key: string]: number }
  userVibes: string[]
  onVibeUpdate?: () => void
}

const vibeTypes = [
  { type: "fire", icon: Flame, color: "text-orange-500", label: "Fire" },
  { type: "sparkle", icon: Sparkles, color: "text-yellow-500", label: "Sparkle" },
  { type: "rocket", icon: Rocket, color: "text-blue-500", label: "Rocket" },
  { type: "inspired", icon: Lightbulb, color: "text-purple-500", label: "Inspired" },
  { type: "mind-blown", icon: Zap, color: "text-pink-500", label: "Mind Blown" },
]

export function VibeButton({
  projectId,
  currentUserId,
  initialVibes,
  userVibes: initialUserVibes,
  onVibeUpdate,
}: VibeButtonProps) {
  const [vibes, setVibes] = useState(initialVibes)
  const [userVibes, setUserVibes] = useState<string[]>(initialUserVibes)
  const [showPicker, setShowPicker] = useState(false)
  const [animatingVibe, setAnimatingVibe] = useState<string | null>(null)

  const handleVibeClick = async (type: string) => {
    if (!currentUserId) return

    const hasVibe = userVibes.includes(type)
    setAnimatingVibe(type)

    try {
      const method = hasVibe ? "DELETE" : "POST"
      const response = await fetch("/api/vibes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, type }),
      })

      if (!response.ok) throw new Error("Failed to update vibe")

      setUserVibes((prev) =>
        hasVibe ? prev.filter((v) => v !== type) : [...prev, type]
      )
      setVibes((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + (hasVibe ? -1 : 1),
      }))
      onVibeUpdate?.()
    } catch (error) {
      console.error("Failed to update vibe:", error)
    } finally {
      setTimeout(() => setAnimatingVibe(null), 500)
    }
  }

  const totalVibes = Object.values(vibes).reduce((sum, count) => sum + count, 0)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPicker(!showPicker)}
        className="gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-purple-300 transition-all"
      >
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="font-semibold">{totalVibes}</span>
        <span className="text-xs text-gray-600">vibes</span>
      </Button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 flex gap-2 z-10"
          >
            {vibeTypes.map(({ type, icon: Icon, color, label }) => {
              const count = vibes[type] || 0
              const hasVibe = userVibes.includes(type)
              const isAnimating = animatingVibe === type

              return (
                <motion.button
                  key={type}
                  onClick={() => handleVibeClick(type)}
                  disabled={!currentUserId}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    hasVibe
                      ? "bg-gradient-to-br from-purple-50 to-pink-50 ring-2 ring-purple-400"
                      : "hover:bg-gray-50"
                  } ${!currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <AnimatePresence>
                      {isAnimating && (
                        <motion.div
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <Icon className={`w-5 h-5 ${color}`} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs font-medium">{count}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
