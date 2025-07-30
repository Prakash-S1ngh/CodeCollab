import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

interface ExecutionResult {
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT'
  output?: string
  error?: string
  executionTime?: number
  memoryUsage?: number
  testsPassed?: number
  totalTests?: number
  testResults?: Array<{
    passed: boolean
    input: string
    expected: string
    actual: string
  }>
}

export async function executeCode(
  code: string, 
  language: string, 
  testCases: TestCase[] = []
): Promise<ExecutionResult> {
  const startTime = Date.now()
  
  try {
    switch (language) {
      case 'javascript':
        return await executeJavaScript(code, testCases, startTime)
      case 'python':
        return await executePython(code, testCases, startTime)
      case 'java':
        return await executeJava(code, testCases, startTime)
      case 'cpp':
        return await executeCpp(code, testCases, startTime)
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  } catch (error) {
    return {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime
    }
  }
}

async function executeJavaScript(
  code: string, 
  testCases: TestCase[], 
  startTime: number
): Promise<ExecutionResult> {
  const tempFile = join(tmpdir(), `code_${Date.now()}.js`)
  
  try {
    // Write code to temporary file
    await writeFile(tempFile, code)
    
    // Execute the code
    const result = await runProcess('node', [tempFile], 5000) // 5 second timeout
    
    const executionTime = Date.now() - startTime
    
    if (testCases.length === 0) {
      return {
        status: 'SUCCESS',
        output: result.stdout,
        error: result.stderr || undefined,
        executionTime
      }
    }
    
    // Run test cases
    const testResults = await runTestCases(code, testCases, 'javascript')
    const testsPassed = testResults.filter(t => t.passed).length
    
    return {
      status: 'SUCCESS',
      output: result.stdout,
      error: result.stderr || undefined,
      executionTime,
      testsPassed,
      totalTests: testCases.length,
      testResults
    }
  } finally {
    // Clean up temporary file
    try {
      await unlink(tempFile)
    } catch (error) {
      console.error('Failed to delete temp file:', error)
    }
  }
}

async function executePython(
  code: string, 
  testCases: TestCase[], 
  startTime: number
): Promise<ExecutionResult> {
  const tempFile = join(tmpdir(), `code_${Date.now()}.py`)
  
  try {
    await writeFile(tempFile, code)
    const result = await runProcess('python3', [tempFile], 5000)
    
    const executionTime = Date.now() - startTime
    
    if (testCases.length === 0) {
      return {
        status: 'SUCCESS',
        output: result.stdout,
        error: result.stderr || undefined,
        executionTime
      }
    }
    
    const testResults = await runTestCases(code, testCases, 'python')
    const testsPassed = testResults.filter(t => t.passed).length
    
    return {
      status: 'SUCCESS',
      output: result.stdout,
      error: result.stderr || undefined,
      executionTime,
      testsPassed,
      totalTests: testCases.length,
      testResults
    }
  } finally {
    try {
      await unlink(tempFile)
    } catch (error) {
      console.error('Failed to delete temp file:', error)
    }
  }
}

async function executeJava(
  code: string, 
  testCases: TestCase[], 
  startTime: number
): Promise<ExecutionResult> {
  const tempDir = join(tmpdir(), `java_${Date.now()}`)
  const tempFile = join(tempDir, 'Solution.java')
  
  try {
    await writeFile(tempFile, code)
    
    // Compile Java code
    const compileResult = await runProcess('javac', [tempFile], 10000)
    
    if (compileResult.stderr) {
      return {
        status: 'ERROR',
        error: compileResult.stderr,
        executionTime: Date.now() - startTime
      }
    }
    
    // Run compiled code
    const result = await runProcess('java', ['-cp', tempDir, 'Solution'], 5000)
    
    const executionTime = Date.now() - startTime
    
    if (testCases.length === 0) {
      return {
        status: 'SUCCESS',
        output: result.stdout,
        error: result.stderr || undefined,
        executionTime
      }
    }
    
    const testResults = await runTestCases(code, testCases, 'java')
    const testsPassed = testResults.filter(t => t.passed).length
    
    return {
      status: 'SUCCESS',
      output: result.stdout,
      error: result.stderr || undefined,
      executionTime,
      testsPassed,
      totalTests: testCases.length,
      testResults
    }
  } finally {
    // Clean up temporary files
    try {
      await unlink(tempFile)
    } catch (error) {
      console.error('Failed to delete temp file:', error)
    }
  }
}

async function executeCpp(
  code: string, 
  testCases: TestCase[], 
  startTime: number
): Promise<ExecutionResult> {
  const tempFile = join(tmpdir(), `code_${Date.now()}.cpp`)
  const executable = join(tmpdir(), `code_${Date.now()}`)
  
  try {
    await writeFile(tempFile, code)
    
    // Compile C++ code
    const compileResult = await runProcess('g++', [tempFile, '-o', executable], 10000)
    
    if (compileResult.stderr) {
      return {
        status: 'ERROR',
        error: compileResult.stderr,
        executionTime: Date.now() - startTime
      }
    }
    
    // Run compiled executable
    const result = await runProcess(executable, [], 5000)
    
    const executionTime = Date.now() - startTime
    
    if (testCases.length === 0) {
      return {
        status: 'SUCCESS',
        output: result.stdout,
        error: result.stderr || undefined,
        executionTime
      }
    }
    
    const testResults = await runTestCases(code, testCases, 'cpp')
    const testsPassed = testResults.filter(t => t.passed).length
    
    return {
      status: 'SUCCESS',
      output: result.stdout,
      error: result.stderr || undefined,
      executionTime,
      testsPassed,
      totalTests: testCases.length,
      testResults
    }
  } finally {
    // Clean up temporary files
    try {
      await unlink(tempFile)
      await unlink(executable)
    } catch (error) {
      console.error('Failed to delete temp files:', error)
    }
  }
}

async function runProcess(
  command: string, 
  args: string[], 
  timeout: number
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let stdout = ''
    let stderr = ''
    
    process.stdout?.on('data', (data) => {
      stdout += data.toString()
    })
    
    process.stderr?.on('data', (data) => {
      stderr += data.toString()
    })
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        resolve({ stdout, stderr: stderr || `Process exited with code ${code}` })
      }
    })
    
    process.on('error', (error) => {
      reject(error)
    })
    
    process.on('timeout', () => {
      process.kill()
      reject(new Error('Execution timeout'))
    })
  })
}

async function runTestCases(
  code: string, 
  testCases: TestCase[], 
  language: string
): Promise<Array<{ passed: boolean; input: string; expected: string; actual: string }>> {
  const results = []
  
  for (const testCase of testCases) {
    try {
      // Create test code that includes the solution and runs the test
      const testCode = createTestCode(code, testCase, language)
      const tempFile = join(tmpdir(), `test_${Date.now()}_${testCase.id}`)
      
      try {
        await writeFile(tempFile, testCode)
        
        let command: string
        let args: string[]
        
        switch (language) {
          case 'javascript':
            command = 'node'
            args = [tempFile]
            break
          case 'python':
            command = 'python3'
            args = [tempFile]
            break
          case 'java':
            command = 'java'
            args = ['-cp', tmpdir(), 'TestSolution']
            break
          case 'cpp':
            command = tempFile.replace('.cpp', '')
            args = []
            break
          default:
            throw new Error(`Unsupported language for testing: ${language}`)
        }
        
        const result = await runProcess(command, args, 3000)
        const actualOutput = result.stdout.trim()
        const passed = actualOutput === testCase.expectedOutput.trim()
        
        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: actualOutput
        })
      } finally {
        try {
          await unlink(tempFile)
        } catch (error) {
          console.error('Failed to delete test file:', error)
        }
      }
    } catch (error) {
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: error instanceof Error ? error.message : 'Test execution failed'
      })
    }
  }
  
  return results
}

function createTestCode(code: string, testCase: TestCase, language: string): string {
  switch (language) {
    case 'javascript':
      return `${code}

// Test case
const input = ${JSON.stringify(testCase.input)};
const result = solution(input);
console.log(result);`
    
    case 'python':
      return `${code}

# Test case
input = ${JSON.stringify(testCase.input)}
result = solution(input)
print(result)`
    
    case 'java':
      return `${code}

class TestSolution {
    public static void main(String[] args) {
        String input = ${JSON.stringify(testCase.input)};
        String result = Solution.solution(input);
        System.out.println(result);
    }
}`
    
    case 'cpp':
      return `${code}

int main() {
    string input = ${JSON.stringify(testCase.input)};
    string result = solution(input);
    cout << result << endl;
    return 0;
}`
    
    default:
      throw new Error(`Unsupported language for test code generation: ${language}`)
  }
} 