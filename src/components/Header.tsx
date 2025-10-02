"use client"

import Link from "next/link"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { Sparkles, Plus, TrendingUp } from "lucide-react"

export function Header() {
  const { isLoaded, isSignedIn, user } = useUser()

  return (
    <header className="glass border-b border-white/30 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <Logo size="md" />
          <div className="flex flex-col">
            <span className="font-bold text-xl aurora-text font-playfair">
              ForTheVibes
            </span>
            <span className="text-xs text-gray-600 -mt-1">For the vibes & vibecode</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-2">
          <Link href="/projects">
            <Button variant="ghost">
              Browse Projects
            </Button>
          </Link>
          <Link href="/?sort=trending">
            <Button variant="ghost">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {!isLoaded ? (
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse" />
          ) : isSignedIn ? (
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/submit">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </Link>
              </motion.div>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SignInButton mode="modal">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}