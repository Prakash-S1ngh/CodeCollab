import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import multer from 'multer'
import path from 'path'

const router = express.Router()
const prisma = new PrismaClient()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Update user profile
router.put('/profile', authenticateToken, [
  body('displayName').optional().isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('githubUrl').optional().isURL().withMessage('GitHub URL must be a valid URL'),
  body('linkedinUrl').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
  body('websiteUrl').optional().isURL().withMessage('Website URL must be a valid URL'),
  body('skillLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).withMessage('Invalid skill level'),
  body('languages').optional().isArray().withMessage('Languages must be an array')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const userId = req.user!.userId
    const updateData = req.body

    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.email
    delete updateData.createdAt
    delete updateData.updatedAt

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
})

// Upload avatar
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const userId = req.user!.userId
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
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

    return res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { 
        user: updatedUser,
        avatarUrl: avatarUrl
      }
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    })
  }
})

// Get user profile by username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
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
        createdAt: true
      }
    })

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
    console.error('Get user profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    })
  }
})

export default router 