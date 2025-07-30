'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Download, Upload, Settings, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import { Button } from '@codearena/ui'
import Editor from '@monaco-editor/react'

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category: string[]
  examples: TestCase[]
  constraints: string[]
  timeLimit: number
  memoryLimit: number
}

interface CodeExecution {
  id: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'TIMEOUT'
  output?: string
  error?: string
  executionTime?: number
  memoryUsage?: number
  testsPassed?: number
  totalTests?: number
}

interface CodeIDEProps {
  problem?: Problem
  initialCode?: string
  language?: string
  onCodeChange?: (code: string) => void
  onRun?: (execution: CodeExecution) => void
}

const defaultCode = {
  javascript: `function solution(input) {
    // Your solution here
    return input;
}

// Test your solution
console.log(solution("test input"));`,
  python: `def solution(input):
    # Your solution here
    return input

# Test your solution
print(solution("test input"))`,
  java: `public class Solution {
    public static String solution(String input) {
        // Your solution here
        return input;
    }
    
    public static void main(String[] args) {
        // Test your solution
        System.out.println(solution("test input"));
    }
}`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your solution here
    return input;
}

int main() {
    // Test your solution
    cout << solution("test input") << endl;
    return 0;
}`
}

export default function CodeIDE({ 
  problem, 
  initialCode, 
  language = 'javascript',
  onCodeChange,
  onRun 
}: CodeIDEProps) {
  const [code, setCode] = useState(initialCode || defaultCode[language as keyof typeof defaultCode] || defaultCode.javascript)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [execution, setExecution] = useState<CodeExecution | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'output' | 'testcases' | 'settings'>('output')
  const [testResults, setTestResults] = useState<any[]>([])
  const editorRef = useRef<any>(null)

  const languages = [
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'cpp', name: 'C++', extension: '.cpp' }
  ]

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage)
    const newCode = defaultCode[newLanguage as keyof typeof defaultCode] || defaultCode.javascript
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const runCode = async () => {
    if (!code.trim()) return

    setIsRunning(true)
    setExecution({
      id: Date.now().toString(),
      status: 'RUNNING'
    })

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          problemId: problem?.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        setExecution(data.data)
        setTestResults(data.data.testResults || [])
        onRun?.(data.data)
      } else {
        setExecution({
          id: Date.now().toString(),
          status: 'ERROR',
          error: data.message || 'Execution failed'
        })
      }
    } catch (error) {
      setExecution({
        id: Date.now().toString(),
        status: 'ERROR',
        error: 'Network error occurred'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    const defaultCodeForLanguage = defaultCode[selectedLanguage as keyof typeof defaultCode] || defaultCode.javascript
    setCode(defaultCodeForLanguage)
    onCodeChange?.(defaultCodeForLanguage)
    setExecution(null)
    setTestResults([])
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solution${languages.find(l => l.id === selectedLanguage)?.extension || '.txt'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const uploadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCode(content)
        onCodeChange?.(content)
      }
      reader.readAsText(file)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-500'
      case 'ERROR': return 'text-red-500'
      case 'TIMEOUT': return 'text-orange-500'
      case 'RUNNING': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />
      case 'ERROR': return <XCircle className="w-4 h-4" />
      case 'RUNNING': return <Clock className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-background border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-background border border-input rounded-md px-3 py-1 text-sm"
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={runCode}
              disabled={isRunning}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            
            <Button
              onClick={resetCode}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={downloadCode}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".js,.py,.java,.cpp,.txt"
              onChange={uploadCode}
              className="hidden"
            />
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Code Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={selectedLanguage}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: false,
            }}
          />
        </div>

        {/* Right Panel */}
        <div className="w-96 border-l bg-muted/30">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('output')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'output' 
                  ? 'bg-background border-b-2 border-primary-500' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'testcases' 
                  ? 'bg-background border-b-2 border-primary-500' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Test Cases
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'settings' 
                  ? 'bg-background border-b-2 border-primary-500' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 h-full overflow-y-auto">
            {activeTab === 'output' && (
              <div className="space-y-4">
                {execution && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`${getStatusColor(execution.status)}`}>
                        {getStatusIcon(execution.status)}
                      </span>
                      <span className="font-medium capitalize">{execution.status}</span>
                      {execution.executionTime && (
                        <span className="text-sm text-muted-foreground">
                          {execution.executionTime}ms
                        </span>
                      )}
                    </div>

                    {execution.output && (
                      <div className="bg-background border rounded p-3">
                        <h4 className="font-medium mb-2">Output:</h4>
                        <pre className="text-sm whitespace-pre-wrap">{execution.output}</pre>
                      </div>
                    )}

                    {execution.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Error:</h4>
                        <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{execution.error}</pre>
                      </div>
                    )}

                    {execution.testsPassed !== undefined && (
                      <div className="bg-background border rounded p-3">
                        <h4 className="font-medium mb-2">Test Results:</h4>
                        <div className="text-sm">
                          <span className="text-green-600">{execution.testsPassed}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span>{execution.totalTests}</span>
                          <span className="text-muted-foreground"> tests passed</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!execution && (
                  <div className="text-center text-muted-foreground py-8">
                    <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Click Run to execute your code</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-4">
                {problem?.examples.map((testCase, index) => (
                  <div key={testCase.id} className="bg-background border rounded p-3">
                    <h4 className="font-medium mb-2">Test Case {index + 1}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Input:</span>
                        <pre className="mt-1 bg-muted p-2 rounded">{testCase.input}</pre>
                      </div>
                      <div>
                        <span className="font-medium">Expected Output:</span>
                        <pre className="mt-1 bg-muted p-2 rounded">{testCase.expectedOutput}</pre>
                      </div>
                      {testResults[index] && (
                        <div className={`p-2 rounded ${
                          testResults[index].passed 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        }`}>
                          {testResults[index].passed ? '✓ Passed' : '✗ Failed'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Editor Settings</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Auto-save
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Word wrap
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Minimap
                    </label>
                  </div>
                </div>

                {problem && (
                  <div>
                    <h4 className="font-medium mb-2">Problem Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Difficulty:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          problem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                          problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Time Limit:</span>
                        <span className="ml-2">{problem.timeLimit}ms</span>
                      </div>
                      <div>
                        <span className="font-medium">Memory Limit:</span>
                        <span className="ml-2">{problem.memoryLimit}MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 