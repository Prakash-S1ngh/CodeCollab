'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth'
import axios from 'axios'

export default function JoinSessionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [joinMethod, setJoinMethod] = useState<'code' | 'id'>('code')
  const [inviteCode, setInviteCode] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) {
      setError('Please enter an invite code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/sessions/join-by-code', {
        inviteCode: inviteCode.trim().toUpperCase()
      })

      if (response.data.success) {
        router.push(`/sessions/${response.data.data.session.id}`)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to join session')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinById = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId.trim()) {
      setError('Please enter a session ID')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`/api/sessions/${sessionId.trim()}/join`)

      if (response.data.success) {
        router.push(`/sessions/${sessionId.trim()}`)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to join session')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Join Session</h1>
          <p className="text-gray-400">Please sign in to join a session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Join Session</h1>
        
        {/* Join Method Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setJoinMethod('code')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              joinMethod === 'code'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Invite Code
          </button>
          <button
            onClick={() => setJoinMethod('id')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              joinMethod === 'id'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Session ID
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Join by Invite Code */}
        {joinMethod === 'code' && (
          <form onSubmit={handleJoinByCode} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter 6-character invite code"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter the 6-character invite code provided by the session host
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Joining...' : 'Join Session'}
            </button>
          </form>
        )}

        {/* Join by Session ID */}
        {joinMethod === 'id' && (
          <form onSubmit={handleJoinById} className="space-y-4">
            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium text-gray-300 mb-2">
                Session ID
              </label>
              <input
                type="text"
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter the session ID if you have it directly
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Joining...' : 'Join Session'}
            </button>
          </form>
        )}

        {/* Back to Sessions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/sessions')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Sessions
          </button>
        </div>
      </div>
    </div>
  )
} 