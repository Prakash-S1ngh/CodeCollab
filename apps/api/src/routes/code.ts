import express from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../index'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { executeCode } from '../services/codeExecutor'

const router = express.Router()

// Validation middleware
const validateCodeExecution = [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp']).withMessage('Invalid language'),
  body('problemId').optional().isString(),
]

// @route   POST /api/code/execute
// @desc    Execute code and run tests
// @access  Private
router.post('/execute', authenticateToken, validateCodeExecution, async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { code, language, problemId } = req.body
    const userId = req.user.id

    // Get problem details if problemId is provided
    let problem = null
    if (problemId) {
      problem = await prisma.challenge.findUnique({
        where: { id: problemId },
        select: {
          id: true,
          title: true,
          description: true,
          examples: true
        }
      })
    }

    // Execute the code
    const startTime = Date.now()
    const executionResult = await executeCode(code, language, [])
    const executionTime = Date.now() - startTime

    // Save execution to database
    const execution = await prisma.codeExecution.create({
      data: {
        sessionId: 'standalone', // For standalone executions
        userId,
        challengeId: problemId,
        code,
        language,
        output: executionResult.output,
        error: executionResult.error,
        executionTime,
        memoryUsage: executionResult.memoryUsage,
        status: executionResult.status,
        testsPassed: executionResult.testsPassed,
        totalTests: executionResult.totalTests
      }
    })

    res.json({
      success: true,
      data: {
        id: execution.id,
        status: execution.status,
        output: execution.output,
        error: execution.error,
        executionTime: execution.executionTime,
        memoryUsage: execution.memoryUsage,
        testsPassed: execution.testsPassed,
        totalTests: execution.totalTests,
        testResults: executionResult.testResults
      }
    })
  } catch (error) {
    console.error('Code execution error:', error)
    res.status(500).json({
      success: false,
      message: 'Code execution failed'
    })
  }
})

// @route   GET /api/code/executions
// @desc    Get user's code executions
// @access  Private
router.get('/executions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const executions = await prisma.codeExecution.findMany({
      where: { userId: req.user.id },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.codeExecution.count({
      where: { userId: req.user.id }
    })

    res.json({
      success: true,
      data: {
        executions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get executions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch executions'
    })
  }
})

// @route   GET /api/code/executions/:id
// @desc    Get specific code execution
// @access  Private
router.get('/executions/:id', authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params

    const execution = await prisma.codeExecution.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            description: true
          }
        }
      }
    })

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Execution not found'
      })
    }

    res.json({
      success: true,
      data: { execution }
    })
  } catch (error) {
    console.error('Get execution error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch execution'
    })
  }
})

export default router 