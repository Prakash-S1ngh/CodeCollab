'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, User, Code, Users, Trophy } from 'lucide-react'
import { Button } from '@codearena/ui'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              CodeArena
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{user.name}!</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to code, compete, and collaborate?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect rounded-2xl p-6 border hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Session</h3>
              <p className="text-muted-foreground mb-4">
                Start or join a multiplayer coding session
              </p>
              <Button className="w-full">Start Coding</Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect rounded-2xl p-6 border hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">DSA Challenges</h3>
              <p className="text-muted-foreground mb-4">
                Practice with curated algorithm problems
              </p>
              <Button className="w-full">View Problems</Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect rounded-2xl p-6 border hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mock Interview</h3>
              <p className="text-muted-foreground mb-4">
                Practice with AI-powered interviews
              </p>
              <Button className="w-full">Start Interview</Button>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="glass-effect rounded-2xl p-8 border">
            <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
                <div className="text-muted-foreground">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600 mb-2">0</div>
                <div className="text-muted-foreground">Sessions Joined</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">0</div>
                <div className="text-muted-foreground">Interviews Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">Beginner</div>
                <div className="text-muted-foreground">Current Rank</div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 