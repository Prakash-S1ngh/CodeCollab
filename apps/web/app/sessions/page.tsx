'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
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
  host: {
    id: string
    displayName: string
  }
  participants: Array<{
    user: {
      id: string
    }
  }>
}

export default function SessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'public',
    language: 'JavaScript',
    difficulty: 'Easy',
    maxParticipants: 2
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/sessions')
      if (response.data.success) {
        setSessions(response.data.data.sessions)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = async (sessionId: string) => {
    if (!user) {
      window.location.href = '/auth'
      return
    }

    setJoining(sessionId)
    try {
      const response = await axios.post(`/api/sessions/${sessionId}/join`)
      if (response.data.success) {
        // Refresh sessions to update participant count
        await fetchSessions()
      }
    } catch (error: any) {
      console.error('Error joining session:', error)
      alert(error.response?.data?.message || 'Failed to join session')
    } finally {
      setJoining(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Coding Sessions</h1>
          <p>Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Coding Sessions</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create Session'}
            </button>
            <button
              onClick={() => window.location.href = '/sessions/join'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Join Session
            </button>
          </div>
        </div>

        {showCreateForm && (
          <form
            className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700 max-w-xl mx-auto"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!user) {
                alert('You must be logged in to create a session.')
                return
              }
              setCreating(true)
              try {
                const response = await axios.post('/api/sessions', {
                  ...form
                })
                // console.log(response.data);
                if (response.data.success) {
                  setShowCreateForm(false)
                  setForm({ title: '', type: 'public', language: 'JavaScript', difficulty: 'EASY', maxParticipants: 2 })
                  await fetchSessions()
                } else {
                  alert(response.data.message+" hello" || 'Failed to create session')
                }
              } catch (error: any) {
                alert(error.response?.data?.message+" Dhoom" || 'Failed to create session')
              } finally {
                setCreating(false)
              }
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Create a New Session</h2>
            <div className="mb-3">
              <label className="block mb-1">Title</label>
              <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 rounded bg-gray-700 text-white">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Language</label>
              <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="w-full px-3 py-2 rounded bg-gray-700 text-white">
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full px-3 py-2 rounded bg-gray-700 text-white">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Max Participants</label>
              <input type="number" min={2} max={20} required value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: Number(e.target.value) }))} className="w-full px-3 py-2 rounded bg-gray-700 text-white" />
            </div>
            <button type="submit" disabled={creating} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-medium w-full mt-2">
              {creating ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">{session.title}</h3>
              <div className="space-y-2 mb-4">
                <p><span className="text-gray-400">Host:</span> {session.host.displayName}</p>
                <p><span className="text-gray-400">Type:</span> {session.type}</p>
                <p><span className="text-gray-400">Language:</span> {session.language}</p>
                <p><span className="text-gray-400">Difficulty:</span> {session.difficulty}</p>
                <p><span className="text-gray-400">Participants:</span> {session.currentParticipants}/{session.maxParticipants}</p>
                <p><span className="text-gray-400">Status:</span> {session.status}</p>
                <p><span className="text-gray-400">Code:</span> <code className="bg-gray-700 px-2 py-1 rounded">{session.inviteCode}</code></p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = `/sessions/${session.id}`}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
                >
                  View Session
                </button>
                {user && !session.participants.some(p => p.user.id === user.id) && session.currentParticipants < session.maxParticipants && (
                  <button
                    onClick={() => handleJoinSession(session.id)}
                    disabled={joining === session.id}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium"
                  >
                    {joining === session.id ? 'Joining...' : 'Join'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-400 mb-4">No sessions available</h3>
            <p className="text-gray-500">Create a session to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
} 