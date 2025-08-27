import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProblems = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]`,
    difficulty: 'EASY',
    category: ['ARRAYS'],
    tags: ['hash-table', 'array'],
    examples: [
      {
        input: '[2,7,11,15]',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
      },
      {
        input: '[3,2,4]',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'Try using a hash table to store the numbers you have seen',
      'For each number, check if target - number exists in the hash table'
    ],
    solution: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

Open brackets must be closed by the same type of brackets.
Open brackets must be closed in the correct order.
Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false`,
    difficulty: 'EASY',
    category: ['STRINGS'],
    tags: ['stack', 'string'],
    examples: [
      {
        input: '"()"',
        output: 'true',
        explanation: 'Simple valid parentheses'
      },
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: 'Multiple valid parentheses'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\''
    ],
    hints: [
      'Use a stack to keep track of opening brackets',
      'When you see a closing bracket, check if it matches the top of the stack'
    ],
    solution: `function isValid(s: string): boolean {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char in pairs) {
            if (stack.pop() !== pairs[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Maximum Subarray',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1]
Output: 1

Example 3:
Input: nums = [5,4,-1,7,8]
Output: 23`,
    difficulty: 'MEDIUM',
    category: ['ARRAYS'],
    tags: ['array', 'divide-and-conquer', 'dynamic-programming'],
    examples: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'Subarray [4,-1,2,1] has sum 6'
      },
      {
        input: '[1]',
        output: '1',
        explanation: 'Single element array'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    hints: [
      'Think about what happens when you encounter a negative number',
      'Keep track of the current sum and the maximum sum seen so far'
    ],
    solution: `function maxSubArray(nums: number[]): number {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Reverse Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example 1:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Example 2:
Input: head = [1,2]
Output: [2,1]

Example 3:
Input: head = []
Output: []`,
    difficulty: 'EASY',
    category: ['LINKED_LISTS'],
    tags: ['linked-list', 'recursion'],
    examples: [
      {
        input: '[1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'Reverse the entire linked list'
      },
      {
        input: '[1,2]',
        output: '[2,1]',
        explanation: 'Reverse two nodes'
      }
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000]',
      '-5000 <= Node.val <= 5000'
    ],
    hints: [
      'Use three pointers: previous, current, and next',
      'Iteratively reverse the links between nodes'
    ],
    solution: `function reverseList(head: ListNode | null): ListNode | null {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Binary Tree Inorder Traversal',
    description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

Example 1:
Input: root = [1,null,2,3]
Output: [1,3,2]

Example 2:
Input: root = []
Output: []

Example 3:
Input: root = [1]
Output: [1]`,
    difficulty: 'EASY',
    category: ['TREES'],
    tags: ['stack', 'tree', 'depth-first-search'],
    examples: [
      {
        input: '[1,null,2,3]',
        output: '[1,3,2]',
        explanation: 'Inorder: left -> root -> right'
      },
      {
        input: '[1]',
        output: '[1]',
        explanation: 'Single node tree'
      }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 100]',
      '-100 <= Node.val <= 100'
    ],
    hints: [
      'Inorder traversal visits nodes in this order: left subtree, root, right subtree',
      'You can use recursion or a stack for iterative solution'
    ],
    solution: `function inorderTraversal(root: TreeNode | null): number[] {
    const result = [];
    
    function inorder(node: TreeNode | null) {
        if (node === null) return;
        
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    }
    
    inorder(root);
    return result;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  }
]

async function seedProblems() {
  try {
    console.log('🌱 Seeding problems...')
    
    for (const problem of sampleProblems) {
      const existingProblem = await prisma.challenge.findFirst({
        where: { title: problem.title }
      })
      
      if (!existingProblem) {
        await prisma.challenge.create({
          data: {
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty as any,
            category: problem.category,
            tags: problem.tags,
            examples: problem.examples as any,
            constraints: problem.constraints,
            hints: problem.hints,
            solution: problem.solution,
            timeComplexity: problem.timeComplexity,
            spaceComplexity: problem.spaceComplexity,
            popularity: Math.floor(Math.random() * 1000),
            successRate: Math.random() * 100,
            totalAttempts: Math.floor(Math.random() * 5000),
            totalSolved: Math.floor(Math.random() * 2000),
            isActive: true
          }
        })
        console.log(`✅ Created problem: ${problem.title}`)
      } else {
        console.log(`⏭️  Problem already exists: ${problem.title}`)
      }
    }
    
    console.log('🎉 Problems seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding problems:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProblems() 