import axios from 'axios'

export interface Judge0Submission {
  source_code: string
  language_id: number
  stdin?: string
  expected_output?: string
  cpu_time_limit?: number
  memory_limit?: number
  enable_network?: boolean
}

export interface Judge0Response {
  token: string
  status?: {
    id: number
    description: string
  }
  stdout?: string
  stderr?: string
  compile_output?: string
  message?: string
  time?: string
  memory?: string
}

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

// Judge0 Language IDs
const LANGUAGE_IDS: Record<string, number> = {
  'javascript': 63,    // Node.js
  'python': 71,        // Python 3
  'java': 62,          // Java
  'cpp': 54,           // C++17
  'c': 50,             // C
  'csharp': 51,        // C#
  'go': 60,            // Go
  'rust': 73,          // Rust
  'php': 68,           // PHP
  'ruby': 72,          // Ruby
  'swift': 83,         // Swift
  'kotlin': 78,        // Kotlin
  'scala': 81,         // Scala
  'typescript': 74,    // TypeScript
  'r': 80,             // R
  'bash': 46,          // Bash
  'sql': 82,           // SQL
  'pascal': 67,        // Pascal
  'lua': 64,           // Lua
  'perl': 85,          // Perl
  'haskell': 61,       // Haskell
  'clojure': 86,       // Clojure
  'dart': 87,          // Dart
  'elixir': 57,        // Elixir
  'erlang': 58,        // Erlang
  'fsharp': 69,        // F#
  'groovy': 89,        // Groovy
  'julia': 90,         // Julia
  'nim': 91,           // Nim
  'ocaml': 79,         // OCaml
  'racket': 95,        // Racket
  'reason': 96,        // Reason
  'solidity': 97,      // Solidity
  'vbnet': 84,         // VB.NET
}

// Judge0 Status IDs
const STATUS_IDS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR: 7,
  MEMORY_LIMIT_EXCEEDED: 8,
  SYSTEM_ERROR: 9
}

class Judge0Service {
  private baseUrl = 'https://judge0-ce.p.rapidapi.com'
  private apiKey = 'e21c651f76msh9e051b447f4ab20p16df6djsn8bfd26a06278'
  private headers = {
    'x-rapidapi-key': this.apiKey,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  }

  async submitCode(submission: Judge0Submission): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/submissions`,
        submission,
        { headers: this.headers }
      )
      return response.data.token
    } catch (error) {
      console.error('Judge0 submission error:', error)
      throw new Error('Failed to submit code to Judge0')
    }
  }

  async getSubmission(token: string): Promise<Judge0Response> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/submissions/${token}`,
        { headers: this.headers }
      )
      return response.data
    } catch (error) {
      console.error('Judge0 get submission error:', error)
      throw new Error('Failed to get submission from Judge0')
    }
  }

  async waitForSubmission(token: string, maxWaitTime: number = 30000): Promise<Judge0Response> {
    const startTime = Date.now()
    const pollInterval = 1000 // 1 second

    while (Date.now() - startTime < maxWaitTime) {
      const submission = await this.getSubmission(token)
      
      if (submission.status && submission.status.id > 2) {
        return submission
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error('Submission timeout')
  }

  private mapJudge0Status(statusId: number): ExecutionResult['status'] {
    switch (statusId) {
      case STATUS_IDS.ACCEPTED:
        return 'ACCEPTED'
      case STATUS_IDS.WRONG_ANSWER:
        return 'WRONG_ANSWER'
      case STATUS_IDS.TIME_LIMIT_EXCEEDED:
        return 'TIME_LIMIT_EXCEEDED'
      case STATUS_IDS.MEMORY_LIMIT_EXCEEDED:
        return 'MEMORY_LIMIT_EXCEEDED'
      case STATUS_IDS.RUNTIME_ERROR:
        return 'RUNTIME_ERROR'
      case STATUS_IDS.COMPILATION_ERROR:
        return 'COMPILATION_ERROR'
      default:
        return 'SYSTEM_ERROR'
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
    const languageId = LANGUAGE_IDS[language.toLowerCase()]
    if (!languageId) {
      return {
        status: 'SYSTEM_ERROR',
        executionTime: 0,
        memoryUsed: 0,
        output: null,
        error: `Unsupported language: ${language}`
      }
    }

    try {
      const submission: Judge0Submission = {
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: expectedOutput,
        cpu_time_limit: Math.ceil(timeLimit / 1000), // Convert to seconds
        memory_limit: memoryLimit * 1024, // Convert to KB
        enable_network: false
      }

      const token = await this.submitCode(submission)
      const result = await this.waitForSubmission(token)

      const status = this.mapJudge0Status(result.status?.id || STATUS_IDS.SYSTEM_ERROR)
      const executionTime = result.time ? parseFloat(result.time) * 1000 : 0 // Convert to milliseconds
      const memoryUsed = result.memory ? parseFloat(result.memory) : 0

      let output = null
      let error = null
      let compileError = undefined

      if (status === 'ACCEPTED') {
        output = result.stdout || ''
      } else if (status === 'COMPILATION_ERROR') {
        compileError = result.compile_output || result.stderr || 'Compilation failed'
        error = compileError
      } else {
        error = result.stderr || result.message || 'Execution failed'
      }

      // Check if output matches expected (for non-compilation errors)
      if (status === 'ACCEPTED' && expectedOutput) {
        const normalizedOutput = this.normalizeOutput(output || '')
        const normalizedExpected = this.normalizeOutput(expectedOutput)
        
        if (normalizedOutput !== normalizedExpected) {
          return {
            status: 'WRONG_ANSWER',
            executionTime,
            memoryUsed,
            output,
            error: `Expected: ${expectedOutput}\nGot: ${output}`,
            compileError
          }
        }
      }

      return {
        status,
        executionTime,
        memoryUsed,
        output,
        error,
        compileError
      }
    } catch (error) {
      return {
        status: 'SYSTEM_ERROR',
        executionTime: 0,
        memoryUsed: 0,
        output: null,
        error: `Judge0 error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
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

  private normalizeOutput(output: string): string {
    return output
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/\s+/g, ' ')
  }

  // Get supported languages
  getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_IDS)
  }

  // Get language configuration
  getLanguageConfig(language: string): { id: number; name: string } | null {
    const id = LANGUAGE_IDS[language.toLowerCase()]
    return id ? { id, name: language } : null
  }

  // Test Judge0 connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/config_info`, {
        headers: this.headers
      })
      return response.status === 200
    } catch (error) {
      console.error('Judge0 connection test failed:', error)
      return false
    }
  }
}

export const judge0Service = new Judge0Service() 