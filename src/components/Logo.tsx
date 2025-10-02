"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, Heart } from "lucide-react"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  }

  return (
    <div className={`${sizes[size]} relative`}>
      {/* Main circle with gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500 shadow-lg"
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Sparkle icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className={`${iconSizes[size]} text-white`} strokeWidth={2.5} />
        </div>

        {/* Floating vibes */}
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            y: [0, -3, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md flex items-center justify-center">
            <Zap className="w-2 h-2 text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div
          className="absolute -bottom-1 -left-1"
          animate={{
            y: [0, 3, 0],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <div className="w-3 h-3 rounded-full bg-rose-400 shadow-md flex items-center justify-center">
            <Heart className="w-2 h-2 text-white fill-white" strokeWidth={0} />
          </div>
        </motion.div>
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 opacity-30 blur-md -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
