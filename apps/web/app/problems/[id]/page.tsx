'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Clock, Zap, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@codearena/ui'
import CodeIDE from '@/components/CodeIDE'
import Link from 'next/link'

interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  category: string[]
  examples: Array<{
    id: string
    input: string
    expectedOutput: string
    isHidden: boolean
  }>
  constraints: string[]
  timeLimit: number
  memoryLimit: number
}

export default function ProblemPage() {
  const params = useParams()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'description' | 'solution' | 'submissions'>('description')
  const [code, setCode] = useState('')

  const problemId = params.id as string

  useEffect(() => {
    fetchProblem()
  }, [problemId])

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/challenges/${problemId}`)
      const data = await response.json()

      if (data.success) {
        setProblem(data.data)
      } else {
        console.error('Failed to fetch problem:', data.message)
      }
    } catch (error) {
      console.error('Error fetching problem:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const handleRun = (execution: any) => {
    console.log('Code execution result:', execution)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'HARD': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
          <Link href="/problems">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/20 to-secondary-50/20 dark:from-background dark:via-primary-950/20 dark:to-secondary-950/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/problems">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{problem.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.category.map((cat, index) => (
                    <span key={index} className="text-sm text-muted-foreground">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {problem.timeLimit}ms
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4" />
                {problem.memoryLimit}MB
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Problem Description */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'description' 
                    ? 'border-b-2 border-primary-500 text-primary-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('solution')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'solution' 
                    ? 'border-b-2 border-primary-500 text-primary-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Solution
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'submissions' 
                    ? 'border-b-2 border-primary-500 text-primary-600' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Submissions
              </button>
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto h-full">
              {activeTab === 'description' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Problem Description */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Problem Description</h2>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>

                  {/* Examples */}
                  {problem.examples.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Examples</h2>
                      <div className="space-y-4">
                        {problem.examples.map((example, index) => (
                          <div key={example.id} className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-medium mb-2">Example {index + 1}:</h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Input:</span>
                                <pre className="mt-1 bg-background p-2 rounded">{example.input}</pre>
                              </div>
                              <div>
                                <span className="font-medium">Output:</span>
                                <pre className="mt-1 bg-background p-2 rounded">{example.expectedOutput}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Constraints</h2>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {problem.constraints.map((constraint, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary-500 mt-1">•</span>
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'solution' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Solution Approach</h3>
                    <p className="text-muted-foreground">
                      Try to solve this problem yourself first! Use the code editor to implement your solution.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'submissions' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your Submissions</h3>
                    <p className="text-muted-foreground">
                      Your submission history will appear here once you solve the problem.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="h-full">
            <CodeIDE
              problem={problem}
              initialCode={code}
              onCodeChange={handleCodeChange}
              onRun={handleRun}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 