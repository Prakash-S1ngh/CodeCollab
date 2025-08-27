'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/auth'
import axios from 'axios'
import CodeIDE from '../../../../components/CodeIDE'

interface Session {
  id: string
  title: string
  status: string
  language: string
  currentCode: string
  host: {
    id: string
    displayName: string
  }
  participants: Array<{
    user: {
      id: string
      displayName: string
    }
  }>
}

export default function SessionCodePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSession()
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/sessions/${params.id}`)
      if (response.data.success) {
        const sessionData = response.data.data.session
        setSession(sessionData)
        setCode(sessionData.currentCode || '')
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch session')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    // TODO: Implement real-time code sync with other participants
  }

  const handleRunCode = async () => {
    try {
      const response = await axios.post('/api/code/execute', {
        code,
        language: session?.language || 'javascript',
        sessionId: params.id
      })

      if (response.data.success) {
        // Handle code execution result
        console.log('Code executed:', response.data)
      }
    } catch (error: any) {
      console.error('Code execution error:', error)
    }
  }

  const isParticipant = session?.participants.some(p => p.user.id === user?.id)
  const isHost = session?.host.id === user?.id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="bg-gray-800 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error || 'Session not found'}</p>
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

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You need to be a participant to access this session.</p>
            <button
              onClick={() => router.push(`/sessions/${params.id}`)}
              className="mt-4 bg-yellow-700 hover:bg-yellow-600 px-4 py-2 rounded"
            >
              Back to Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (session.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-blue-900 border border-blue-700 text-blue-200 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Session Not Active</h2>
            <p>This session has not been started yet.</p>
            <button
              onClick={() => router.push(`/sessions/${params.id}`)}
              className="mt-4 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Back to Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{session.title}</h1>
            <p className="text-gray-400 text-sm">
              {session.participants.length} participants • {session.language}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs ${
              session.status === 'ACTIVE' ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
            }`}>
              {session.status}
            </span>
            <button
              onClick={() => router.push(`/sessions/${params.id}`)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Code Editor */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                <h2 className="font-semibold">Code Editor</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{session.language}</span>
                  <button
                    onClick={handleRunCode}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium"
                  >
                    Run Code
                  </button>
                </div>
              </div>
              <div className="h-96">
                <CodeIDE
                  value={code}
                  onChange={handleCodeChange}
                  language={session.language}
                  theme="vs-dark"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Participants</h3>
              <div className="space-y-2">
                {session.participants.map((participant) => (
                  <div key={participant.user.id} className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {participant.user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">
                      {participant.user.displayName}
                      {participant.user.id === session.host.id && (
                        <span className="ml-1 text-blue-400">(Host)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Session Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Language:</span>
                  <span className="ml-2">{session.language}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="ml-2">{session.status}</span>
                </div>
                <div>
                  <span className="text-gray-400">Participants:</span>
                  <span className="ml-2">{session.participants.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/sessions/${params.id}`)}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
                >
                  Session Details
                </button>
                <button
                  onClick={() => router.push('/sessions')}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
                >
                  All Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 