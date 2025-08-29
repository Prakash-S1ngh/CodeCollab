import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { mockUsers, findMockUserById } from '../utils/mockUsers'

const router = express.Router()

// @route   GET /api/sessions
// @desc    Get all sessions
// @access  Public
router.get('/', async (req: Request, res: Response) => {
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
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json({
      success: true,
      data: { sessions }
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post('/', authenticateToken,  async (req: AuthRequest, res: Response) => {
  try {

    const { title, type, maxParticipants, language, difficulty, timeLimit, challengeId } = req.body
    const userId = req.user.id;
    const isPrivate = type =='private';
    console.log(req.body);
    console.log("userId in createsession ",userId);

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const session = await prisma.codingSession.create({
      data: {
        title,
        maxParticipants,
        language,
        difficulty,
        timeLimit,
        challengeId,
        isPrivate: isPrivate || false,
        inviteCode,
        hostId: userId
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    // Add host as first participant
    await prisma.sessionParticipant.create({
      data: {
        userId,
        sessionId: session.id,
        isReady: true
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    })
  } catch (error) {
    console.error('Create session error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create session'
    })
  }
})

// @route   POST /api/sessions/:id/join
// @desc    Join a session
// @access  Private
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    // Check if session exists
    const session = await prisma.codingSession.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      })
    }

    // Check if session is full
    if (session.currentParticipants >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      })
    }

    // Check if user is already a participant
    const existingParticipant = session.participants.find(p => p.userId === userId)
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of this session'
      })
    }

    // Add user as participant
    await prisma.sessionParticipant.create({
      data: {
        userId,
        sessionId: id
      }
    })

    // Update session participant count
    await prisma.codingSession.update({
      where: { id },
      data: {
        currentParticipants: {
          increment: 1
        }
      }
    })

    return res.json({
      success: true,
      message: 'Joined session successfully',
      data: { session }
    })
  } catch (error) {
    console.error('Join session error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to join session'
    })
  }
})

// @route   POST /api/sessions/join-by-code
// @desc    Join a session by invite code
// @access  Private
router.post('/join-by-code', authenticateToken, [
  body('inviteCode').isLength({ min: 6, max: 6 }).withMessage('Invalid invite code')
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

    const { inviteCode } = req.body
    const userId = req.user!.userId

    // Find session by invite code
    const session = await prisma.codingSession.findUnique({
      where: { inviteCode },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      })
    }

    // Check if session is full
    if (session.currentParticipants >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      })
    }

    // Check if user is already a participant
    const existingParticipant = session.participants.find(p => p.userId === userId)
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already part of this session'
      })
    }

    // Add user as participant
    await prisma.sessionParticipant.create({
      data: {
        userId,
        sessionId: session.id
      }
    })

    // Update session participant count
    await prisma.codingSession.update({
      where: { id: session.id },
      data: {
        currentParticipants: {
          increment: 1
        }
      }
    })

    return res.json({
      success: true,
      message: 'Joined session successfully',
      data: { session }
    })
  } catch (error) {
    console.error('Join session by code error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to join session'
    })
  }
})

// @route   GET /api/sessions/:id
// @desc    Get session details
// @access  Private
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const session = await prisma.codingSession.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        },
        challenge: true,
        messages: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      })
    }

    // Check if user is part of the session
    const isParticipant = session.participants.some((p: any) => p.userId === userId)
    if (!isParticipant && session.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    return res.json({
      success: true,
      data: { session }
    })
  } catch (error) {
    console.error('Get session error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get session'
    })
  }
})

// @route   POST /api/sessions/:id/start
// @desc    Start a session (host only)
// @access  Private
router.post('/:id/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const session = await prisma.codingSession.findUnique({
      where: { id },
      include: {
        participants: true
      }
    })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      })
    }

    // Check if user is the host
    if (session.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can start the session'
      })
    }

    // Check if session is already active
    if (session.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Session is already active'
      })
    }

    // Update session status
    await prisma.codingSession.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        startedAt: new Date()
      }
    })

    return res.json({
      success: true,
      message: 'Session started successfully'
    })
  } catch (error) {
    console.error('Start session error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to start session'
    })
  }
})

// @route   POST /api/sessions/:id/leave
// @desc    Leave a session
// @access  Private
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const session = await prisma.codingSession.findUnique({
      where: { id }
    })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      })
    }

    // Remove user from participants
    await prisma.sessionParticipant.deleteMany({
      where: {
        userId,
        sessionId: id
      }
    })

    // Update session participant count
    await prisma.codingSession.update({
      where: { id },
      data: {
        currentParticipants: {
          decrement: 1
        }
      }
    })

    return res.json({
      success: true,
      message: 'Left session successfully'
    })
  } catch (error) {
    console.error('Leave session error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to leave session'
    })
  }
})

// @route   POST /api/sessions/mock-interview
// @desc    Create a mock interview session
// @access  Private
router.post('/mock-interview', authenticateToken, [
  body('title').isLength({ min: 1 }).withMessage('Title is required'),
  body('difficulty').isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Invalid difficulty level'),
  body('language').isLength({ min: 1 }).withMessage('Language is required')
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

    const { title, difficulty, language, timeLimit } = req.body
    const userId = req.user!.userId

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create mock interview session
    const session = await prisma.codingSession.create({
      data: {
        title: `Mock Interview: ${title}`,
        type: 'MOCK_INTERVIEW',
        maxParticipants: 2, // Mock interview is 1-on-1
        language,
        difficulty,
        timeLimit: timeLimit || 45, // Default 45 minutes
        isPrivate: false,
        inviteCode,
        hostId: userId
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    // Add host as first participant
    await prisma.sessionParticipant.create({
      data: {
        userId,
        sessionId: session.id,
        isReady: true
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Mock interview session created successfully',
      data: { session }
    })
  } catch (error) {
    console.error('Create mock interview error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create mock interview session'
    })
  }
})

export default router 