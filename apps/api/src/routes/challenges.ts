import express from 'express'
import { prisma } from '../index'

const router = express.Router()

// @route   GET /api/challenges
// @desc    Get all challenges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: { popularity: 'desc' }
    })

    res.json({
      success: true,
      data: { challenges }
    })
  } catch (error) {
    console.error('Get challenges error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router 