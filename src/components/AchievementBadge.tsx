"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface AchievementBadgeProps {
  icon: LucideIcon
  title: string
  description: string
  color: string
  gradient: string
  unlocked: boolean
}

export function AchievementBadge({
  icon: Icon,
  title,
  description,
  color,
  gradient,
  unlocked,
}: AchievementBadgeProps) {
  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05, y: -4 } : {}}
      className={`glass rounded-xl p-4 transition-all ${
        unlocked
          ? `border-2 shadow-lg`
          : "opacity-50 grayscale border-2 border-gray-200"
      }`}
      style={{
        borderColor: unlocked ? color : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            unlocked ? `bg-gradient-to-br ${gradient}` : "bg-gray-200"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${unlocked ? "text-white" : "text-gray-400"}`}
          />
        </div>
        <div className="flex-1">
          <h3
            className={`font-bold text-sm mb-1 ${
              unlocked ? "text-slate-800" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>

      {unlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl -z-10 opacity-30"
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
    </motion.div>
  )
}
