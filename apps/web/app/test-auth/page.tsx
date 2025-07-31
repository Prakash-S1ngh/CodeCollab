'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function TestAuthPage() {
  const { signIn, signUp, user, isLoading } = useAuth()
  const [result, setResult] = useState('')
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Test User')

  const testSignUp = async () => {
    try {
      setResult('Testing signup...')
      await signUp(name, email, password)
      setResult('Signup successful!')
    } catch (error) {
      setResult(`Signup failed: ${error}`)
    }
  }

  const testSignIn = async () => {
    try {
      setResult('Testing signin...')
      await signIn(email, password)
      setResult('Signin successful!')
    } catch (error) {
      setResult(`Signin failed: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-4 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="space-x-4 mb-4">
        <button onClick={testSignUp} className="bg-blue-500 text-white px-4 py-2 rounded">
          Test Signup
        </button>
        <button onClick={testSignIn} className="bg-green-500 text-white px-4 py-2 rounded">
          Test Signin
        </button>
      </div>

      <div className="mb-4">
        <strong>Result:</strong> {result}
      </div>

      <div className="mb-4">
        <strong>Current User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}
      </div>

      <div>
        <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
      </div>
    </div>
  )
} 