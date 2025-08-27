import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { hybridExecutor } from '../services/hybridExecutor'

const router = express.Router()
const prisma = new PrismaClient()

// Get all problems with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const difficulty = req.query.difficulty as string
    const category = req.query.category as string
    const search = req.query.search as string
    const skip = (page - 1) * limit

    const where: any = {}

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (category && category.length > 0) {
      where.category = {
        has: category
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [problems, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          timeComplexity: true,
          spaceComplexity: true,
          totalAttempts: true,
          successRate: true,
          createdAt: true,
          _count: {
            select: {
              executions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.challenge.count({ where })
    ])

    return res.json({
      success: true,
      data: {
        problems,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get problems error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    })
  }
})

// Get problem by ID with test cases
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const problem = await prisma.challenge.findUnique({
      where: { id },
      include: {
        testCases: {
          where: { isHidden: false }, // Only show visible test cases
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            timeLimit: true,
            memoryLimit: true
          }
        },
        _count: {
          select: {
            executions: true
          }
        }
      }
    })

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    return res.json({
      success: true,
      data: { problem }
    })
  } catch (error) {
    console.error('Get problem error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch problem'
    })
  }
})

// Submit solution with hybrid judging
router.post('/:id/submit', authenticateToken, [
  body('code').isString().notEmpty().withMessage('Code is required'),
  body('language').isString().notEmpty().withMessage('Language is required')
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

    const { id } = req.params
    const { code, language } = req.body
    const userId = req.user!.userId

    // Check if problem exists
    const problem = await prisma.challenge.findUnique({
      where: { id },
      include: {
        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            timeLimit: true,
            memoryLimit: true
          }
        }
      }
    })

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    // Create execution
    const execution = await prisma.codeExecution.create({
      data: {
        sessionId: 'temp-session',
        userId,
        challengeId: id,
        code,
        language,
        status: 'PENDING'
      }
    })

    try {
      // Execute code against all test cases using hybrid executor
      const testCases = problem.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        timeLimit: tc.timeLimit,
        memoryLimit: tc.memoryLimit
      }))

      const result = await hybridExecutor.executeMultipleTestCases(code, language, testCases)
      
      // Count passed tests
      const passedTests = result.testCaseResults?.filter(tc => tc.status === 'PASSED').length || 0
      const totalTests = testCases.length

      // Update execution with results
      await prisma.codeExecution.update({
        where: { id: execution.id },
        data: {
          status: result.status as any,
          executionTime: result.executionTime,
          memoryUsage: result.memoryUsed,
          output: result.output,
          error: result.error,
          testsPassed: passedTests,
          totalTests: totalTests
        }
      })

      // Update challenge statistics
      const newTotalAttempts = problem.totalAttempts + 1
      const newSuccessRate = result.status === 'ACCEPTED' ? 
        ((problem.successRate * problem.totalAttempts + 1) / newTotalAttempts) :
        (problem.successRate * problem.totalAttempts / newTotalAttempts)

      await prisma.challenge.update({
        where: { id },
        data: {
          totalAttempts: newTotalAttempts,
          successRate: newSuccessRate
        }
      })

      return res.json({
        success: true,
        data: {
          execution: {
            id: execution.id,
            status: result.status,
            executionTime: result.executionTime,
            memoryUsed: result.memoryUsed,
            output: result.output,
            error: result.error,
            testsPassed: passedTests,
            totalTests: totalTests,
            testCaseResults: result.testCaseResults,
            passed: result.status === 'ACCEPTED',
            executor: result.executor
          }
        }
      })
    } catch (executionError) {
      // Update execution with error
      await prisma.codeExecution.update({
        where: { id: execution.id },
        data: {
          status: 'SYSTEM_ERROR',
          error: executionError instanceof Error ? executionError.message : 'Unknown execution error'
        }
      })

      throw executionError
    }
  } catch (error) {
    console.error('Submit solution error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to submit solution'
    })
  }
})

// Get user executions for a problem
router.get('/:id/submissions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [executions, total] = await Promise.all([
      prisma.codeExecution.findMany({
        where: {
          challengeId: id,
          userId
        },
        select: {
          id: true,
          code: true,
          language: true,
          status: true,
          executionTime: true,
          memoryUsage: true,
          testsPassed: true,
          totalTests: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.codeExecution.count({
        where: {
          challengeId: id,
          userId
        }
      })
    ])

    return res.json({
      success: true,
      data: {
        submissions: executions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get submissions error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    })
  }
})

// Get supported languages from hybrid executor
router.get('/languages/supported', async (req: Request, res: Response) => {
  try {
    const languages = hybridExecutor.getSupportedLanguages()
    return res.json({
      success: true,
      data: { languages }
    })
  } catch (error) {
    console.error('Get languages error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supported languages'
    })
  }
})

// Get executor status
router.get('/executor/status', async (req: Request, res: Response) => {
  try {
    const status = hybridExecutor.getExecutorStatus()
    return res.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Get executor status error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to get executor status'
    })
  }
})

// Refresh Judge0 status
router.post('/executor/refresh', async (req: Request, res: Response) => {
  try {
    const status = await hybridExecutor.refreshJudge0Status()
    return res.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Refresh executor status error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh executor status'
    })
  }
})

export default router 