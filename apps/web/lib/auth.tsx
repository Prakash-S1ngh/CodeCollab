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
      // Check for existing tokens
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (accessToken && refreshToken) {
        // Validate the token by making a request to get user info
        try {
          const response = await axios.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          })
          
          if (response.data.success) {
            const userData = response.data.data.user
            setUser({
              id: userData.id,
              name: userData.displayName,
              email: userData.email,
              avatar: userData.avatar
            })
          } else {
            // Clear invalid tokens
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {

      const response = await axios.post('/api/auth/signin', {
        email,
        password,
      })


      const { user, accessToken, refreshToken } = response.data.data
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser({
        id: user.id,
        name: user.displayName,
        email: user.email,
        avatar: user.avatar
      })
      

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

      const response = await axios.post('/api/auth/signup', {
        displayName: name,
        username: email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''), // Clean username generation
        email,
        password
      })


      const { user, accessToken, refreshToken } = response.data.data
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser({
        id: user.id,
        name: user.displayName,
        email: user.email,
        avatar: user.avatar
      })
      

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
      const token = localStorage.getItem('accessToken')
      if (token) {
        await axios.post('/api/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }

      // Clear tokens regardless of response
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      // Still clear tokens on error
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement Google OAuth
      console.log('Signing in with Google')
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock user data
      const mockUser: User = {
        id: '2',
        name: 'Google User',
        email: 'google@example.com',
        avatar: 'https://avatars.githubusercontent.com/u/2?v=4'
      }
      
      setUser(mockUser)
      // localStorage.setItem('auth_token', 'google_token')
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
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