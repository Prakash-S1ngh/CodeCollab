'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configure axios defaults - use relative URLs to hit Next.js API routes
axios.defaults.baseURL = ''
axios.defaults.withCredentials = true

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Just call /api/auth/me, cookies will be sent automatically
      const response = await axios.get('/api/auth/me')

      if (response.data.success) {
        const userData = response.data.data.user
        setUser({
          id: userData.id,
          name: userData.displayName,
          email: userData.email,
          avatar: userData.avatar
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
      console.error('Auth check failed:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await axios.post('/api/auth/signin', { email, password })
      await checkAuth()
    } catch (error: any) {
      console.error('Sign in failed:', error)
      throw new Error(error.response?.data?.message || 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      await axios.post('/api/auth/signup', {
        displayName: name,
        username: email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''),
        email,
        password
      })
      await checkAuth()
    } catch (error: any) {
      console.error('Sign up failed:', error)
      throw new Error(error.response?.data?.message || 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await axios.post('/api/auth/logout')
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      // Open Google OAuth popup
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const popup = window.open(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/auth/google`,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Wait for the popup to close or receive message
      return new Promise<void>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            reject(new Error('Authentication cancelled'))
          }
        }, 1000)

        const messageHandler = async (event: MessageEvent) => {
          if (event.origin !== (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')) {
            return
          }

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageHandler)
            popup.close()
            await checkAuth()
            resolve()
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageHandler)
            popup.close()
            reject(new Error(event.data.error || 'Google authentication failed'))
          }
        }

        window.addEventListener('message', messageHandler)
      })
    } catch (error: any) {
      console.error('Google auth error:', error)
      throw new Error(error.message || 'Google authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 