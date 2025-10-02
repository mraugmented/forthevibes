interface ProjectForTrending {
  id: string
  createdAt: Date
  _count: {
    stars: number
  }
}

/**
 * Calculate trending score for a project
 * Based on Hacker News algorithm with time decay
 */
export function calculateTrendingScore(project: ProjectForTrending): number {
  const now = new Date()
  const ageInHours = (now.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60)

  // Minimum stars to prevent division issues
  const stars = Math.max(project._count.stars, 1)

  // Gravity factor - higher values make posts decay faster
  const gravity = 1.8

  // Time penalty - posts lose score as they age
  const timePenalty = Math.pow(ageInHours + 2, gravity)

  // Calculate score
  const score = (stars - 1) / timePenalty

  return score
}

/**
 * Sort projects by trending score
 */
export function sortProjectsByTrending(projects: ProjectForTrending[]): ProjectForTrending[] {
  return projects
    .map(project => ({
      ...project,
      trendingScore: calculateTrendingScore(project)
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
}

/**
 * Get trending projects with a minimum threshold
 */
export function getTrendingProjects(
  projects: ProjectForTrending[],
  minStars: number = 1,
  maxAge: number = 7 * 24 // 7 days in hours
): ProjectForTrending[] {
  const now = new Date()

  return projects
    .filter(project => {
      const ageInHours = (now.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60)
      return project._count.stars >= minStars && ageInHours <= maxAge
    })
    .map(project => ({
      ...project,
      trendingScore: calculateTrendingScore(project)
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
}