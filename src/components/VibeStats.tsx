"use client"

import { motion } from "framer-motion"
import { Flame, Sparkles, Rocket, Lightbulb, Zap } from "lucide-react"

interface VibeStatsProps {
  vibes: {
    fire: number
    sparkle: number
    rocket: number
    inspired: number
    "mind-blown": number
  }
  totalVibes: number
}

const vibeTypes = [
  { type: "fire", icon: Flame, color: "#FF6B5B", gradient: "from-orange-400 to-red-500", label: "Fire" },
  { type: "sparkle", icon: Sparkles, color: "#FFC107", gradient: "from-yellow-400 to-amber-500", label: "Sparkle" },
  { type: "rocket", icon: Rocket, color: "#0EA5E9", gradient: "from-blue-400 to-cyan-500", label: "Rocket" },
  { type: "inspired", icon: Lightbulb, color: "#14B8A6", gradient: "from-teal-400 to-emerald-500", label: "Inspired" },
  { type: "mind-blown", icon: Zap, color: "#FB7185", gradient: "from-rose-400 to-pink-500", label: "Mind Blown" },
]

export function VibeStats({ vibes, totalVibes }: VibeStatsProps) {
  const maxVibe = Math.max(...Object.values(vibes))

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Vibes Received</h2>
        <motion.div
          className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-white font-bold text-lg">{totalVibes}</span>
        </motion.div>
      </div>

      <div className="space-y-4">
        {vibeTypes.map(({ type, icon: Icon, color, gradient, label }) => {
          const count = vibes[type as keyof typeof vibes] || 0
          const percentage = maxVibe > 0 ? (count / maxVibe) * 100 : 0

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700">{label}</span>
                </div>
                <span className="font-bold text-slate-800">{count}</span>
              </div>

              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {totalVibes === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No vibes received yet</p>
        </div>
      )}
    </div>
  )
}
