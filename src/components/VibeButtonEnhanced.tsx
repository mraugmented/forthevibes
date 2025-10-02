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
  { type: "fire", icon: Flame, color: "#FF6B5B", gradient: "from-orange-400 to-red-500", label: "Fire" },
  { type: "sparkle", icon: Sparkles, color: "#FFC107", gradient: "from-yellow-400 to-amber-500", label: "Sparkle" },
  { type: "rocket", icon: Rocket, color: "#0EA5E9", gradient: "from-blue-400 to-cyan-500", label: "Rocket" },
  { type: "inspired", icon: Lightbulb, color: "#14B8A6", gradient: "from-teal-400 to-emerald-500", label: "Inspired" },
  { type: "mind-blown", icon: Zap, color: "#FB7185", gradient: "from-rose-400 to-pink-500", label: "Mind Blown" },
]

export function VibeButtonEnhanced({
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
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([])

  const handleVibeClick = async (type: string, color: string) => {
    if (!currentUserId) return

    const hasVibe = userVibes.includes(type)
    setAnimatingVibe(type)

    // Create particle effect
    const particleCount = 8
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      color,
    }))
    setParticles([...particles, ...newParticles])

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 1000)

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
      setTimeout(() => setAnimatingVibe(null), 600)
    }
  }

  const totalVibes = Object.values(vibes).reduce((sum, count) => sum + count, 0)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="lg"
        onClick={() => setShowPicker(!showPicker)}
        className="gap-2 glass border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl"
      >
        <Sparkles className="w-5 h-5 text-teal-500 vibe-float" />
        <span className="font-bold text-slate-800">{totalVibes}</span>
        <span className="text-sm text-slate-600">vibes</span>
      </Button>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0,
              x: particle.x,
              y: particle.y
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>

      {/* Vibe Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 glass rounded-2xl p-4 z-50 shadow-2xl border-2 border-teal-100"
          >
            <div className="flex gap-3">
              {vibeTypes.map(({ type, icon: Icon, color, gradient, label }) => {
                const count = vibes[type] || 0
                const hasVibe = userVibes.includes(type)
                const isAnimating = animatingVibe === type

                return (
                  <motion.button
                    key={type}
                    onClick={() => handleVibeClick(type, color)}
                    disabled={!currentUserId}
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      hasVibe
                        ? `bg-gradient-to-br ${gradient} shadow-lg`
                        : "hover:bg-slate-50 bg-white"
                    } ${!currentUserId ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
                      isAnimating ? "vibe-pulse" : ""
                    }`}
                    style={{
                      border: hasVibe ? `2px solid ${color}` : "2px solid transparent",
                    }}
                  >
                    <motion.div
                      className="relative"
                      animate={hasVibe ? {
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon
                        className={`w-6 h-6 ${hasVibe ? "text-white" : ""}`}
                        style={{ color: hasVibe ? "white" : color }}
                      />
                      {hasVibe && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </motion.div>
                    <div className="text-center">
                      <span className={`text-xs font-bold block ${hasVibe ? "text-white" : "text-slate-700"}`}>
                        {count}
                      </span>
                      <span className={`text-[10px] ${hasVibe ? "text-white" : "text-slate-500"}`}>
                        {label}
                      </span>
                    </div>

                    {/* Glow effect for selected vibes */}
                    {hasVibe && (
                      <motion.div
                        className="absolute inset-0 rounded-xl -z-10"
                        animate={{
                          boxShadow: [
                            `0 0 20px ${color}40`,
                            `0 0 40px ${color}60`,
                            `0 0 20px ${color}40`,
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Tooltip */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-teal-100" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
