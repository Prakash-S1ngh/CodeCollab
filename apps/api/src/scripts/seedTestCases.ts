import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testCases = [
  {
    problemTitle: 'Two Sum',
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        expectedOutput: '[0,1]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[3,2,4]\n6',
        expectedOutput: '[1,2]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[3,3]\n6',
        expectedOutput: '[0,1]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[1,5,8,10,13,18,21,23,25,30]\n31',
        expectedOutput: '[0,9]',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[0,4,3,0]\n0',
        expectedOutput: '[0,3]',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      }
    ]
  },
  {
    problemTitle: 'Valid Parentheses',
    testCases: [
      {
        input: '()',
        expectedOutput: 'true',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '()[]{}',
        expectedOutput: 'true',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '(]',
        expectedOutput: 'false',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '([)]',
        expectedOutput: 'false',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '{[]}',
        expectedOutput: 'true',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '(((',
        expectedOutput: 'false',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      }
    ]
  },
  {
    problemTitle: 'Maximum Subarray',
    testCases: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        expectedOutput: '6',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[1]',
        expectedOutput: '1',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[5,4,-1,7,8]',
        expectedOutput: '23',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[-1,-2,-3,-4]',
        expectedOutput: '-1',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[2,-1,3,-2,4,-3,5,-4,6,-5]',
        expectedOutput: '6',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      }
    ]
  },
  {
    problemTitle: 'Reverse Linked List',
    testCases: [
      {
        input: '[1,2,3,4,5]',
        expectedOutput: '[5,4,3,2,1]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[1,2]',
        expectedOutput: '[2,1]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[]',
        expectedOutput: '[]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[1]',
        expectedOutput: '[1]',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      }
    ]
  },
  {
    problemTitle: 'Binary Tree Inorder Traversal',
    testCases: [
      {
        input: '[1,null,2,3]',
        expectedOutput: '[1,3,2]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[]',
        expectedOutput: '[]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[1]',
        expectedOutput: '[1]',
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 128
      },
      {
        input: '[1,2,3,4,5]',
        expectedOutput: '[4,2,5,1,3]',
        isHidden: true,
        timeLimit: 1000,
        memoryLimit: 128
      }
    ]
  }
]

async function seedTestCases() {
  try {
    console.log('🌱 Seeding test cases...')
    
    for (const problemTestCases of testCases) {
      // Find the problem
      const problem = await prisma.challenge.findFirst({
        where: { title: problemTestCases.problemTitle }
      })
      
      if (!problem) {
        console.log(`⚠️  Problem not found: ${problemTestCases.problemTitle}`)
        continue
      }
      
      console.log(`📝 Adding test cases for: ${problemTestCases.problemTitle}`)
      
      for (const testCase of problemTestCases.testCases) {
        // Check if test case already exists
        const existingTestCase = await prisma.testCase.findFirst({
          where: {
            challengeId: problem.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput
          }
        })
        
        if (!existingTestCase) {
          await prisma.testCase.create({
            data: {
              challengeId: problem.id,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              isHidden: testCase.isHidden,
              timeLimit: testCase.timeLimit,
              memoryLimit: testCase.memoryLimit
            }
          })
          console.log(`  ✅ Added test case: ${testCase.input.substring(0, 20)}...`)
        } else {
          console.log(`  ⏭️  Test case already exists`)
        }
      }
    }
    
    console.log('🎉 Test cases seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding test cases:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestCases() 