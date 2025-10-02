import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      bio?: string | null
      githubUrl?: string | null
      websiteUrl?: string | null
    }
  }

  interface User {
    username?: string | null
    bio?: string | null
    githubUrl?: string | null
    websiteUrl?: string | null
  }
}