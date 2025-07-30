import express from 'express'
import { prisma } from '../index'

const router = express.Router()

// @route   GET /api/competitions
// @desc    Get all competitions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const competitions = await prisma.competition.findMany({
      where: { isPublic: true },
      orderBy: { startDate: 'desc' }
    })

    res.json({
      success: true,
      data: { competitions }
    })
  } catch (error) {
    console.error('Get competitions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router 