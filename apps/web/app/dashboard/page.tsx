'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Code, 
  Users, 
  Trophy, 
  MessageSquare, 
  Video, 
  Settings, 
  LogOut, 
  User,
  Play,
  Plus,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { Button } from '@codearena/ui'
import Link from 'next/link'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  href: string
}

interface RecentSession {
  id: string
  title: string
  type: string
  participants: number
  status: string
  date: string
}

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])

  const quickActions: QuickAction[] = [
    {
      id: 'mock-interview',
      title: 'Mock Interview',
      description: 'Practice with AI interviewer and video call',
      icon: Video,
      color: 'from-blue-500 to-blue-600',
      href: '/mock-interview'
    },
    {
      id: 'join-session',
      title: 'Join Session',
      description: 'Join existing coding sessions',
      icon: Users,
      color: 'from-green-500 to-green-600',
      href: '/sessions/join'
    },
    {
      id: 'create-session',
      title: 'Create Session',
      description: 'Start a new coding session',
      icon: Plus,
      color: 'from-purple-500 to-purple-600',
      href: '/sessions'
    }
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleQuickAction = (href: string) => {
    router.push(href)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              CodeArena
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/sessions">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Users className="w-4 h-4 mr-2" />
                  Sessions
                </Button>
              </Link>
              <Link href="/problems">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Code className="w-4 h-4 mr-2" />
                  Problems
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">{user.name}!</span>
          </h1>
          <p className="text-gray-400">Ready to code, compete, and collaborate?</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                  onClick={() => handleQuickAction(action.href)}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Problems Solved</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
                <Code className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold">7 days</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rating</p>
                  <p className="text-2xl font-bold">1,250</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            {recentSessions.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {recentSessions.map((session) => (
                  <div key={session.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{session.title}</h3>
                        <p className="text-sm text-gray-400">{session.type} • {session.participants} participants</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.status === 'completed' ? 'bg-green-900 text-green-200' :
                        session.status === 'active' ? 'bg-blue-900 text-blue-200' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {session.status}
                      </span>
                      <span className="text-sm text-gray-400">{session.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No recent activity</h3>
                <p className="text-gray-400 mb-4">Start your first session to see your activity here</p>
                <Button onClick={() => router.push('/sessions')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
} 