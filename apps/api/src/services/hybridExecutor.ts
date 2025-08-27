import { judge0Service } from './judge0Service'
import { codeExecutor } from './codeExecutor'

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'SYSTEM_ERROR'
  executionTime: number
  memoryUsed: number
  output: string | null
  error: string | null
  compileError?: string
  testCaseResults?: TestCaseResult[]
  executor: 'judge0' | 'local'
}

export interface TestCaseResult {
  testCaseId: string
  input: string
  expectedOutput: string
  actualOutput: string | null
  status: 'PASSED' | 'FAILED' | 'ERROR'
  executionTime: number
  memoryUsed: number
  error?: string
}

class HybridExecutor {
  private judge0Available: boolean = false

  constructor() {
    this.checkJudge0Availability()
  }

  private async checkJudge0Availability() {
    try {
      this.judge0Available = await judge0Service.testConnection()
      console.log(`Judge0 availability: ${this.judge0Available}`)
    } catch (error) {
      console.log('Judge0 not available, using local executor')
      this.judge0Available = false
    }
  }

  async executeCode(
    code: string,
    language: string,
    input: string,
    expectedOutput: string,
    timeLimit: number = 1000,
    memoryLimit: number = 128
  ): Promise<ExecutionResult> {
    if (this.judge0Available) {
      try {
        const result = await judge0Service.executeCode(code, language, input, expectedOutput, timeLimit, memoryLimit)
        return { ...result, executor: 'judge0' as const }
      } catch (error) {
        console.log('Judge0 execution failed, falling back to local executor')
        this.judge0Available = false
      }
    }

    // Fallback to local executor
    const result = await codeExecutor.executeCode(code, language, input, expectedOutput, timeLimit, memoryLimit)
    return { ...result, executor: 'local' as const }
  }

  async executeMultipleTestCases(
    code: string,
    language: string,
    testCases: Array<{ input: string; expectedOutput: string; timeLimit?: number; memoryLimit?: number }>
  ): Promise<ExecutionResult> {
    if (this.judge0Available) {
      try {
        const result = await judge0Service.executeMultipleTestCases(code, language, testCases)
        return { ...result, executor: 'judge0' as const }
      } catch (error) {
        console.log('Judge0 execution failed, falling back to local executor')
        this.judge0Available = false
      }
    }

    // Fallback to local executor
    const result = await codeExecutor.executeMultipleTestCases(code, language, testCases)
    return { ...result, executor: 'local' as const }
  }

  // Get supported languages (combine both executors)
  getSupportedLanguages(): string[] {
    const judge0Languages = judge0Service.getSupportedLanguages()
    const localLanguages = codeExecutor.getSupportedLanguages()
    
    // Combine and remove duplicates
    const allLanguages = new Set([...judge0Languages, ...localLanguages])
    return Array.from(allLanguages).sort()
  }

  // Get executor status
  getExecutorStatus() {
    return {
      judge0Available: this.judge0Available,
      localAvailable: true,
      recommendedExecutor: this.judge0Available ? 'judge0' : 'local'
    }
  }

  // Force refresh Judge0 availability
  async refreshJudge0Status() {
    await this.checkJudge0Availability()
    return this.getExecutorStatus()
  }
}

export const hybridExecutor = new HybridExecutor() 