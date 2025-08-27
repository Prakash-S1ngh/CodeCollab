import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import passport from 'passport'
import { mockUsers, addMockUser, getMockUser, findMockUserById, getAllMockUsers } from '../utils/mockUsers'
import { configureGoogleStrategy, hasRealGoogleCredentials, generateGoogleTokens, createGoogleAuthResponse } from '../config/googleAuth'

const router = express.Router()
const prisma = new PrismaClient()

const mockUserId = 'mock-user-123'

// Initialize with a test user
const initializeMockUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 12)
  mockUsers.set('test@example.com', {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    passwordHash: hashedPassword,
    avatar: null,
    bio: null,
    githubUrl: null,
    linkedinUrl: null,
    websiteUrl: null,
    languages: [],
    skillLevel: 'BEGINNER',
    rating: 1000,
    totalSessions: 0,
    problemsSolved: 0,
    streak: 0,
    coins: 0,
    emailVerified: true,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

// Initialize mock user
initializeMockUser()

// Configure Google OAuth Strategy
const googleConfigured = configureGoogleStrategy()

// Google OAuth routes
router.get('/google', (req: Request, res: Response) => {
  if (!hasRealGoogleCredentials()) {
    return res.status(400).json({
      success: false,
      message: 'Google OAuth is not configured. Please set up Google OAuth credentials.',
      instructions: [
        '1. Go to Google Cloud Console: https://console.cloud.google.com/',
        '2. Create a new project or select existing one',
        '3. Enable Google+ API',
        '4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID',
        '5. Set Authorized redirect URIs: http://localhost:3002/api/auth/google/callback',
        '6. Add to your .env file:',
        '   GOOGLE_CLIENT_ID=your_client_id',
        '   GOOGLE_CLIENT_SECRET=your_client_secret'
      ]
    })
  }

  return passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res)
})

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/failure',
  session: false
}), (req: Request, res: Response) => {
  try {
    const user = req.user as any

    if (!user) {
      const errorResponse = createGoogleAuthResponse(false, null, 'Authentication failed - no user data')
      return res.send(errorResponse)
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateGoogleTokens(user)

    // Send success message to frontend
    const successResponse = createGoogleAuthResponse(true, {
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        avatar: user.avatar || ''
      },
      accessToken,
      refreshToken
    })

    return res.send(successResponse)
  } catch (error) {
    console.error('Google auth callback error:', error)
    const errorResponse = createGoogleAuthResponse(false, null, 'Authentication failed')
    return res.send(errorResponse)
  }
})

// Google OAuth status endpoint
router.get('/google/status', (req: Request, res: Response) => {
  const isConfigured = hasRealGoogleCredentials()

  return res.json({
    success: true,
    data: {
      configured: isConfigured,
      message: isConfigured
        ? 'Google OAuth is properly configured'
        : 'Google OAuth is not configured. Please set up credentials.',
      instructions: isConfigured ? null : [
        '1. Go to Google Cloud Console: https://console.cloud.google.com/',
        '2. Create a new project or select existing one',
        '3. Enable Google+ API',
        '4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID',
        '5. Set Authorized redirect URIs: http://localhost:3002/api/auth/google/callback',
        '6. Add to your .env file:',
        '   GOOGLE_CLIENT_ID=your_client_id',
        '   GOOGLE_CLIENT_SECRET=your_client_secret'
      ]
    }
  })
})

// Regular signup route
router.post('/signup', [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 6 characters')
], async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
      return
    }

    const { name, email, password } = req.body

    // Check if user already exists (try database first, then mock)
    let existingUser = null
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      console.log('Database not available, checking mock users')
      existingUser = mockUsers.get(email)
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (try database first, fallback to mock)
    let user = null
    try {
      user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0],
          displayName: name,
          passwordHash: hashedPassword,
          isActive: true,
          lastLoginAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          emailVerified: true,
          isActive: true,
          createdAt: true
        }
      })
    } catch (error) {
      console.log('Database not available, creating mock user')
      // Create mock user
      const mockId = `mock-${Date.now()}`
      user = {
        id: mockId,
        email,
        username: email.split('@')[0],
        displayName: name,
        avatar: null,
        emailVerified: false,
        isActive: true,
        createdAt: new Date()
      }
      mockUsers.set(email, {
        ...user,
        passwordHash: hashedPassword,
        lastLoginAt: new Date()
      })
    }

    // Generate tokens
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

    res.json({
      success: true,
      message: 'User created successfully',
      data: {
        user,
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    })
  }
})

// Regular signin route
router.post('/signin', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: Request, res: Response): Promise<any> => {
  try {

    const { email, password } = req.body


    // Try to find user in database first, fallback to mock user
    let user = null
    try {
      user = await prisma.user.findUnique({
        where: { email }
      })
      console.log('Database user:', user)
    } catch (error) {
      console.log('Database not available, using mock user')
    }

    // If no user found in database, check mock users
    if (!user) {
      console.log("user found ", user)
      user = mockUsers.get(email)
      console.log('Mock user:', user)
    } else {
      // If user found in database, also add to mock users for consistency
      console.log('Adding database user to mock users:', user.id)
      mockUsers.set(email, user)
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        prisma: prisma.user
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login (skip if using mock user)
    if (user.id !== mockUserId) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
      } catch (error) {
        console.log('Could not update last login (using mock user)')
      }
    } else {
      user.lastLoginAt = new Date()
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    )
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in prod
      sameSite: 'lax', // or 'none' if cross-site
      maxAge: 2 * 60 * 60 * 1000, // 2h
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    })

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Signin error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate',
      error: error as any
    })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log('Looking for user with ID:', userId)

    // Try to find user in database first, fallback to mock user
    let user = null
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          githubUrl: true,
          linkedinUrl: true,
          websiteUrl: true,
          languages: true,
          skillLevel: true,
          rating: true,
          totalSessions: true,
          problemsSolved: true,
          streak: true,
          coins: true,
          emailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      })

      // If user found in database, also add to mock users for consistency
      if (user) {
        mockUsers.set(user.email, user)
      }
    } catch (error) {
      console.log('Database not available, checking mock users')
      // Find mock user by ID
      console.log('Checking mock users for ID:', userId)
      for (const [email, mockUser] of mockUsers.entries()) {
        console.log('Checking mock user:', mockUser.id, 'against:', userId)
        if (mockUser.id === userId) {
          user = {
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            displayName: mockUser.displayName,
            avatar: mockUser.avatar,
            bio: mockUser.bio,
            githubUrl: mockUser.githubUrl,
            linkedinUrl: mockUser.linkedinUrl,
            websiteUrl: mockUser.websiteUrl,
            languages: mockUser.languages,
            skillLevel: mockUser.skillLevel,
            rating: mockUser.rating,
            totalSessions: mockUser.totalSessions,
            problemsSolved: mockUser.problemsSolved,
            streak: mockUser.streak,
            coins: mockUser.coins,
            emailVerified: mockUser.emailVerified,
            isActive: mockUser.isActive,
            lastLoginAt: mockUser.lastLoginAt,
            createdAt: mockUser.createdAt,
            updatedAt: mockUser.updatedAt
          }
          break
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get user'
    })
  }
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      })
      return
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
      return
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    )

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
})

// Logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // In a real application, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    })
  }
})

// Test endpoint to check mock users (remove in production)
router.get('/test-mock-users', (req: Request, res: Response) => {
  const mockUsersList = Array.from(mockUsers.entries()).map(([email, user]) => ({
    email,
    id: user.id,
    username: user.username,
    displayName: user.displayName
  }))

  return res.json({
    success: true,
    data: {
      mockUsers: mockUsersList,
      totalMockUsers: mockUsers.size
    }
  })
})

export default router 