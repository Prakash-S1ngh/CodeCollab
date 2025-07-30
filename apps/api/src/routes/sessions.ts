import express from 'express'
import { prisma } from '../index'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = express.Router()

// @route   GET /api/sessions
// @desc    Get all sessions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sessions = await prisma.codingSession.findMany({
      where: { isPrivate: false },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: { sessions }
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router 