import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { mockUsers } from '../utils/mockUsers'

const prisma = new PrismaClient()

// Google OAuth Configuration
const GOOGLE_CONFIG = {
  clientID: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3002/api/auth/google/callback',
  scope: ['profile', 'email']
}

// Check if we have real Google credentials
const hasRealGoogleCredentials = () => {
  return GOOGLE_CONFIG.clientID !== 'mock-client-id' && 
         GOOGLE_CONFIG.clientSecret !== 'mock-client-secret'
}

// Configure Google OAuth Strategy
const configureGoogleStrategy = () => {
  if (!hasRealGoogleCredentials()) {
    console.log('⚠️  Using mock Google OAuth credentials. Google Auth will not work properly.')
    console.log('📝 To fix this, set up Google OAuth credentials and add them to your .env file:')
    console.log('   GOOGLE_CLIENT_ID=your_google_client_id')
    console.log('   GOOGLE_CLIENT_SECRET=your_google_client_secret')
    console.log('   GOOGLE_CALLBACK_URL=http://localhost:3002/api/auth/google/callback')
    return false
  }

  passport.use(new GoogleStrategy(GOOGLE_CONFIG, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0]?.value
      if (!email) {
        return done(new Error('No email found in Google profile'))
      }

      // Check if user already exists (try database first, then mock)
      let user = null
      try {
        user = await prisma.user.findFirst({
          where: { email }
        })
      } catch (error) {
        console.log('Database not available for Google OAuth, using mock user')
        user = mockUsers.get(email)
      }

      if (!user) {
        // Create new user (try database first, fallback to mock)
        try {
          user = await prisma.user.create({
            data: {
              email: email,
              username: email.split('@')[0] || `user_${Date.now()}`,
              displayName: profile.displayName || '',
              avatar: profile.photos?.[0]?.value || '',
              passwordHash: '', // Empty for Google OAuth users
              emailVerified: true,
              isActive: true,
              lastLoginAt: new Date()
            }
          })
        } catch (error) {
          console.log('Database not available, creating mock Google user')
          // Create mock user
          const mockId = `google-mock-${Date.now()}`
          user = {
            id: mockId,
            email: email,
            username: email.split('@')[0] || `user_${Date.now()}`,
            displayName: profile.displayName || '',
            avatar: profile.photos?.[0]?.value || '',
            passwordHash: '',
            emailVerified: true,
            isActive: true,
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
          mockUsers.set(email, user)
        }
      } else {
        // Update existing user (try database first, fallback to mock)
        try {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              displayName: profile.displayName || user.displayName,
              avatar: profile.photos?.[0]?.value || user.avatar,
              lastLoginAt: new Date()
            }
          })
        } catch (error) {
          console.log('Database not available, updating mock Google user')
          // Update mock user
          if (mockUsers.has(email)) {
            const mockUser = mockUsers.get(email)
            mockUser.displayName = profile.displayName || mockUser.displayName
            mockUser.avatar = profile.photos?.[0]?.value || mockUser.avatar
            mockUser.lastLoginAt = new Date()
            user = mockUser
          }
        }
      }

      return done(null, user)
    } catch (error) {
      return done(error as Error)
    }
  }))

  console.log('✅ Google OAuth strategy configured successfully')
  return true
}

// Generate JWT tokens for Google OAuth user
const generateGoogleTokens = (user: any) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Create success/error HTML responses
const createGoogleAuthResponse = (success: boolean, data?: any, error?: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  
  if (success && data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              data: {
                user: {
                  id: '${data.user.id}',
                  displayName: '${data.user.displayName}',
                  email: '${data.user.email}',
                  avatar: '${data.user.avatar || ''}'
                },
                accessToken: '${data.accessToken}',
                refreshToken: '${data.refreshToken}'
              }
            }, '${frontendUrl}');
            window.close();
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `
  } else {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: '${error || 'Authentication failed'}'
            }, '${frontendUrl}');
            window.close();
          </script>
          <p>Authentication failed! You can close this window.</p>
        </body>
      </html>
    `
  }
}

export {
  configureGoogleStrategy,
  hasRealGoogleCredentials,
  generateGoogleTokens,
  createGoogleAuthResponse,
  GOOGLE_CONFIG
} 