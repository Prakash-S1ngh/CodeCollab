'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth'
import axios from 'axios'

interface Session {
  id: string
  title: string
  type: string
  status: string
  maxParticipants: number
  currentParticipants: number
  language: string
  difficulty: string
  inviteCode: string
  isPrivate: boolean
  host: {
    id: string
    displayName: string
    avatar?: string
  }
  participants: Array<{
    id: string
    user: {
      id: string
      displayName: string
      avatar?: string
    }
    isReady: boolean
    joinedAt: string
  }>
}

export default function SessionPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSession()
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/sessions/${params.id}`)
      if (response.data.success) {
        setSession(response.data.data.session)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch session')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    setJoining(true)
    setError('')

    try {
      const response = await axios.post(`/api/sessions/${params.id}/join`)
      if (response.data.success) {
        // Refresh session data
        await fetchSession()
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to join session')
    } finally {
      setJoining(false)
    }
  }

  const handleLeaveSession = async () => {
    setJoining(true)
    setError('')

    try {
      const response = await axios.post(`/api/sessions/${params.id}/leave`)
      if (response.data.success) {
        router.push('/sessions')
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to leave session')
    } finally {
      setJoining(false)
    }
  }

  const handleStartSession = async () => {
    if (!session || session.host.id !== user?.id) return

    setJoining(true)
    setError('')

    try {
      const response = await axios.post(`/api/sessions/${params.id}/start`)
      if (response.data.success) {
        // Navigate to the coding interface
        router.push(`/sessions/${params.id}/code`)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to start session')
    } finally {
      setJoining(false)
    }
  }

  const isParticipant = session?.participants.some(p => p.user.id === user?.id)
  const isHost = session?.host.id === user?.id
  const canJoin = session && !isParticipant && session.currentParticipants < session.maxParticipants
  const canStart = session && isHost && session.status === 'WAITING' && session.currentParticipants >= 2

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg p-6 h-64"></div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push('/sessions')}
              className="mt-4 bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
            >
              Back to Sessions
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p>Session not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
            <div className="flex items-center space-x-4 text-gray-400">
              <span>Hosted by {session.host.displayName}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded text-xs ${
                session.status === 'ACTIVE' ? 'bg-green-900 text-green-200' :
                session.status === 'WAITING' ? 'bg-yellow-900 text-yellow-200' :
                'bg-gray-700 text-gray-300'
              }`}>
                {session.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push('/sessions')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Sessions
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Session Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <p className="font-medium">{session.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Language</p>
                  <p className="font-medium">{session.language}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Difficulty</p>
                  <p className="font-medium">{session.difficulty}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Participants</p>
                  <p className="font-medium">{session.currentParticipants}/{session.maxParticipants}</p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Participants</h2>
              <div className="space-y-3">
                {session.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        {participant.user.avatar ? (
                          <img src={participant.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-white font-medium">
                            {participant.user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{participant.user.displayName}</p>
                        <p className="text-sm text-gray-400">
                          Joined {new Date(participant.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {participant.isReady && (
                        <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded">Ready</span>
                      )}
                      {participant.user.id === session.host.id && (
                        <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">Host</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join/Leave Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              
              {!user ? (
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium"
                >
                  Sign In to Join
                </button>
              ) : isParticipant ? (
                <div className="space-y-3">
                  {isHost && canStart && (
                    <button
                      onClick={handleStartSession}
                      disabled={joining}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-medium"
                    >
                      {joining ? 'Starting...' : 'Start Session'}
                    </button>
                  )}
                  <button
                    onClick={handleLeaveSession}
                    disabled={joining}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-medium"
                  >
                    {joining ? 'Leaving...' : 'Leave Session'}
                  </button>
                </div>
              ) : canJoin ? (
                <button
                  onClick={handleJoinSession}
                  disabled={joining}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-medium"
                >
                  {joining ? 'Joining...' : 'Join Session'}
                </button>
              ) : (
                <p className="text-gray-400 text-center">Session is full</p>
              )}
            </div>

            {/* Invite Code */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Invite Code</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <code className="text-2xl font-mono text-center block text-blue-400">
                  {session.inviteCode}
                </code>
              </div>
              <p className="text-sm text-gray-400 mt-2 text-center">
                Share this code with others to invite them
              </p>
            </div>

            {/* Quick Join */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Join</h3>
              <button
                onClick={() => router.push('/sessions/join')}
                className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-medium"
              >
                Join Another Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 