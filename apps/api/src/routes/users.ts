import express from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Validation middleware
const validateProfileUpdate = [
  body('displayName').optional().isLength({ min: 2, max: 50 }),
  body('bio').optional().isLength({ max: 500 }),
  body('githubUrl').optional().isURL(),
  body('linkedinUrl').optional().isURL(),
  body('websiteUrl').optional().isURL(),
  body('languages').optional().isArray(),
  body('skillLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
]

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', optionalAuth, async (req: AuthRequest, res: any) => {
  try {
    const { username } = req.params
    const currentUserId = req.user?.id

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
        createdAt: true,
        updatedAt: true,
        email: true,
        emailVerified: true,
        lastLoginAt: true,
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get follower/following counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: user.id }
      }),
      prisma.follow.count({
        where: { followerId: user.id }
      })
    ])

    // Check if current user is following this user
    let isFollowing = false
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id
          }
        }
      })
      isFollowing = !!follow
    }

    // Get recent achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' },
      take: 5
    })

    // Get recent sessions
    const recentSessions = await prisma.sessionParticipant.findMany({
      where: { userId: user.id },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            language: true,
            difficulty: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' },
      take: 5
    })

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          followersCount,
          followingCount,
          isFollowing: currentUserId ? isFollowing : null
        },
        achievements,
        recentSessions
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validateProfileUpdate, async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const {
      displayName,
      bio,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      languages,
      skillLevel
    } = req.body

    const updateData: any = {}
    
    if (displayName !== undefined) updateData.displayName = displayName
    if (bio !== undefined) updateData.bio = bio
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl
    if (languages !== undefined) updateData.languages = languages
    if (skillLevel !== undefined) updateData.skillLevel = skillLevel

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
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

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      })
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    })

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      })
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId,
        followingId: userId
      }
    })

    res.json({
      success: true,
      message: 'User followed successfully'
    })
  } catch (error) {
    console.error('Follow user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/users/follow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const followerId = req.user.id

    // Delete follow relationship
    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: userId
      }
    })

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    })
  } catch (error) {
    console.error('Unfollow user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/followers/:userId
// @desc    Get user's followers
// @access  Public
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            skillLevel: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.follow.count({
      where: { followingId: userId }
    })

    res.json({
      success: true,
      data: {
        followers: followers.map((f: any) => f.follower),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/following/:userId
// @desc    Get users that a user is following
// @access  Public
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            skillLevel: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.follow.count({
      where: { followerId: userId }
    })

    res.json({
      success: true,
      data: {
        following: following.map((f: any) => f.following),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, skillLevel, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {
      isActive: true
    }

    if (q) {
      where.OR = [
        { username: { contains: q as string, mode: 'insensitive' } },
        { displayName: { contains: q as string, mode: 'insensitive' } }
      ]
    }

    if (skillLevel) {
      where.skillLevel = skillLevel
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        skillLevel: true,
        rating: true,
        totalSessions: true,
        problemsSolved: true
      },
      orderBy: { rating: 'desc' },
      skip,
      take: parseInt(limit as string)
    })

    const total = await prisma.user.count({ where })

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    })
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router 