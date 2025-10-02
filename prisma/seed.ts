import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@forthevibes.fun' },
    update: {},
    create: {
      email: 'demo@forthevibes.fun',
      name: 'Demo Creator',
      username: 'democreator',
      bio: 'Building amazing projects for the vibes!',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      githubUrl: 'https://github.com/democreator',
      websiteUrl: 'https://forthevibes.fun',
      twitterUrl: 'https://twitter.com/democreator',
    },
  })

  console.log('✅ Created demo user:', demoUser.username)

  // Create demo projects
  const projects = [
    {
      title: 'Aurora AI Assistant',
      description: 'A beautiful AI-powered assistant that helps you code faster with natural language. Built with modern UX patterns and smooth animations.',
      demoUrl: 'https://aurora-demo.vercel.app',
      githubUrl: 'https://github.com/democreator/aurora-ai',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      tags: JSON.stringify(['AI', 'Productivity', 'Developer Tools']),
      techStack: JSON.stringify(['Next.js', 'TypeScript', 'OpenAI', 'Tailwind CSS', 'Framer Motion']),
      featured: true,
      views: 1247,
      vibeScore: 89,
    },
    {
      title: 'Bento Design System',
      description: 'A modern component library featuring bento grid layouts and glassmorphism effects. Perfect for building beautiful web apps.',
      demoUrl: 'https://bento-design.vercel.app',
      githubUrl: 'https://github.com/democreator/bento-design',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
      tags: JSON.stringify(['Design System', 'Components', 'UI/UX']),
      techStack: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Storybook']),
      views: 892,
      vibeScore: 67,
    },
    {
      title: 'CodeVibe Live',
      description: 'Real-time collaborative coding platform with live cursors, voice chat, and AI code suggestions. Perfect for pair programming.',
      demoUrl: 'https://codevibe-live.vercel.app',
      githubUrl: 'https://github.com/democreator/codevibe-live',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
      tags: JSON.stringify(['Collaboration', 'Real-time', 'Developer Tools']),
      techStack: JSON.stringify(['Next.js', 'WebRTC', 'Socket.io', 'Monaco Editor', 'PostgreSQL']),
      views: 2103,
      vibeScore: 124,
    },
    {
      title: 'Vibrant Portfolio Builder',
      description: 'Create stunning portfolio websites in minutes with drag-and-drop interface and modern templates. No coding required!',
      demoUrl: 'https://vibrant-portfolio.vercel.app',
      githubUrl: 'https://github.com/democreator/vibrant-portfolio',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      tags: JSON.stringify(['Portfolio', 'No-Code', 'Templates']),
      techStack: JSON.stringify(['Next.js', 'React DnD', 'Prisma', 'Tailwind CSS']),
      views: 543,
      vibeScore: 45,
    },
  ]

  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        userId: demoUser.id,
      },
    })
    console.log('✅ Created project:', project.title)

    // Add some dev updates
    if (project.title === 'Aurora AI Assistant') {
      await prisma.devUpdate.create({
        data: {
          title: 'Major Performance Improvements',
          content: 'We\'ve optimized the AI response time by 60%! The assistant now responds almost instantly to your queries.',
          type: 'feature',
          projectId: project.id,
          userId: demoUser.id,
        },
      })

      await prisma.devUpdate.create({
        data: {
          title: 'Bug Fix: Context Memory Issue',
          content: 'Fixed an issue where the assistant would forget conversation context after 10 messages. Now it remembers everything!',
          type: 'bugfix',
          projectId: project.id,
          userId: demoUser.id,
        },
      })
    }

    if (project.title === 'CodeVibe Live') {
      await prisma.devUpdate.create({
        data: {
          title: 'Voice Chat is Now Live! 🎉',
          content: 'You can now talk with your pair programming partner using high-quality voice chat. Just click the microphone icon!',
          type: 'announcement',
          projectId: project.id,
          userId: demoUser.id,
        },
      })
    }
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
