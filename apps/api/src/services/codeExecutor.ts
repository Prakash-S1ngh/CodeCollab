import { spawn } from 'child_process'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'SYSTEM_ERROR'
  executionTime: number
  memoryUsed: number
  output: string | null
  error: string | null
  compileError?: string
  testCaseResults?: TestCaseResult[]
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

export interface LanguageConfig {
  extension: string
  compileCommand?: string[]
  runCommand: string[]
  timeout: number
  memoryLimit: number
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  'javascript': {
    extension: 'js',
    runCommand: ['node'],
    timeout: 5000,
    memoryLimit: 128
  },
  'python': {
    extension: 'py',
    runCommand: ['python3'],
    timeout: 5000,
    memoryLimit: 128
  },
  'java': {
    extension: 'java',
    compileCommand: ['javac'],
    runCommand: ['java'],
    timeout: 5000,
    memoryLimit: 256
  },
  'cpp': {
    extension: 'cpp',
    compileCommand: ['g++', '-std=c++17', '-O2'],
    runCommand: ['./a.out'],
    timeout: 5000,
    memoryLimit: 256
  },
  'c': {
    extension: 'c',
    compileCommand: ['gcc', '-O2'],
    runCommand: ['./a.out'],
    timeout: 5000,
    memoryLimit: 256
  }
}

export class CodeExecutor {
  private tempDir: string

  constructor() {
    this.tempDir = join(process.cwd(), 'temp')
    this.ensureTempDir()
  }

  private async ensureTempDir() {
    try {
      await mkdir(this.tempDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create temp directory:', error)
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
    const startTime = Date.now()
    const config = LANGUAGE_CONFIGS[language.toLowerCase()]

    if (!config) {
      return {
        status: 'SYSTEM_ERROR',
        executionTime: 0,
        memoryUsed: 0,
        output: null,
        error: `Unsupported language: ${language}`
      }
    }

    const executionId = uuidv4()
    const fileName = `solution_${executionId}.${config.extension}`
    const filePath = join(this.tempDir, fileName)

    try {
      // Write code to file
      await writeFile(filePath, code)

      // Compile if needed
      if (config.compileCommand) {
        const compileResult = await this.compileCode(filePath, config.compileCommand)
        if (compileResult.status !== 'ACCEPTED') {
          return compileResult
        }
      }

      // Execute code
      const result = await this.runCode(filePath, config, input, timeLimit, memoryLimit)
      result.executionTime = Date.now() - startTime

      // Compare output
      if (result.status === 'ACCEPTED') {
        const normalizedOutput = this.normalizeOutput(result.output || '')
        const normalizedExpected = this.normalizeOutput(expectedOutput)
        
        if (normalizedOutput !== normalizedExpected) {
          result.status = 'WRONG_ANSWER'
          result.error = `Expected: ${expectedOutput}\nGot: ${result.output}`
        }
      }

      return result
    } catch (error) {
      return {
        status: 'SYSTEM_ERROR',
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        output: null,
        error: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    } finally {
      // Cleanup
      this.cleanup(filePath, language)
    }
  }

  async executeMultipleTestCases(
    code: string,
    language: string,
    testCases: Array<{ input: string; expectedOutput: string; timeLimit?: number; memoryLimit?: number }>
  ): Promise<ExecutionResult> {
    const results: TestCaseResult[] = []
    let overallStatus: ExecutionResult['status'] = 'ACCEPTED'
    let totalExecutionTime = 0
    let maxMemoryUsed = 0
    let firstError: string | null = null

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      const result = await this.executeCode(
        code,
        language,
        testCase.input,
        testCase.expectedOutput,
        testCase.timeLimit || 1000,
        testCase.memoryLimit || 128
      )

      const testCaseResult: TestCaseResult = {
        testCaseId: `test_${i + 1}`,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        status: result.status === 'ACCEPTED' ? 'PASSED' : 'FAILED',
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        error: result.error || undefined
      }

      results.push(testCaseResult)
      totalExecutionTime += result.executionTime
      maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed)

      // Update overall status
      if (result.status !== 'ACCEPTED') {
        if (overallStatus === 'ACCEPTED') {
          overallStatus = result.status
          firstError = result.error
        }
      }
    }

    return {
      status: overallStatus,
      executionTime: totalExecutionTime,
      memoryUsed: maxMemoryUsed,
      output: null,
      error: firstError,
      testCaseResults: results
    }
  }

  private async compileCode(filePath: string, compileCommand: string[]): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const process = spawn(compileCommand[0], [...compileCommand.slice(1), filePath], {
        cwd: this.tempDir,
        timeout: 10000
      })

      let stderr = ''

      process.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            status: 'ACCEPTED',
            executionTime: 0,
            memoryUsed: 0,
            output: null,
            error: null
          })
        } else {
          resolve({
            status: 'COMPILATION_ERROR',
            executionTime: 0,
            memoryUsed: 0,
            output: null,
            error: stderr || 'Compilation failed'
          })
        }
      })

      process.on('error', () => {
        resolve({
          status: 'SYSTEM_ERROR',
          executionTime: 0,
          memoryUsed: 0,
          output: null,
          error: 'Failed to start compilation process'
        })
      })
    })
  }

  private async runCode(
    filePath: string,
    config: LanguageConfig,
    input: string,
    timeLimit: number,
    memoryLimit: number
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const executablePath = config.compileCommand ? 
        join(this.tempDir, 'a.out') : 
        filePath

      const process = spawn(config.runCommand[0], [...config.runCommand.slice(1), executablePath], {
        cwd: this.tempDir,
        timeout: Math.min(timeLimit, config.timeout)
      })

      let stdout = ''
      let stderr = ''
      let memoryUsed = 0

      process.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (code) => {
        const executionTime = Date.now() - startTime

        if (executionTime > timeLimit) {
          resolve({
            status: 'TIME_LIMIT_EXCEEDED',
            executionTime,
            memoryUsed,
            output: null,
            error: 'Time limit exceeded'
          })
          return
        }

        if (code === 0) {
          resolve({
            status: 'ACCEPTED',
            executionTime,
            memoryUsed,
            output: stdout.trim(),
            error: stderr || null
          })
        } else {
          resolve({
            status: 'RUNTIME_ERROR',
            executionTime,
            memoryUsed,
            output: null,
            error: stderr || `Process exited with code ${code}`
          })
        }
      })

      process.on('error', (error) => {
        resolve({
          status: 'SYSTEM_ERROR',
          executionTime: Date.now() - startTime,
          memoryUsed,
          output: null,
          error: `Execution error: ${error.message}`
        })
      })

      // Send input to process
      if (input) {
        process.stdin?.write(input)
        process.stdin?.end()
      }
    })
  }

  private normalizeOutput(output: string): string {
    return output
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/\s+/g, ' ')
  }

  private async cleanup(filePath: string, language: string) {
    try {
      await unlink(filePath)
      
      // Clean up compiled files
      if (LANGUAGE_CONFIGS[language.toLowerCase()]?.compileCommand) {
        const baseName = filePath.replace(/\.[^/.]+$/, '')
        await unlink(`${baseName}.out`).catch(() => {})
        await unlink(`${baseName}.exe`).catch(() => {})
        await unlink('a.out').catch(() => {})
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_CONFIGS)
  }

  // Get language configuration
  getLanguageConfig(language: string): LanguageConfig | null {
    return LANGUAGE_CONFIGS[language.toLowerCase()] || null
  }
}

export const codeExecutor = new CodeExecutor() 