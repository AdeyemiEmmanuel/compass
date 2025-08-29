import { Question, User } from './types'

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@fisk.edu', major: 'Computer Science', graduationYear: 2025 },
  { id: '2', name: 'Marcus Johnson', email: 'marcus@fisk.edu', major: 'Mathematics', graduationYear: 2026 },
  { id: '3', name: 'Alex Kim', email: 'alex@fisk.edu', major: 'Chemistry', graduationYear: 2025 },
  { id: '4', name: 'Jordan Davis', email: 'jordan@fisk.edu', major: 'Statistics', graduationYear: 2024 },
]

export const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'Need help with binary tree traversal algorithms',
    content: "I'm struggling to understand the difference between inorder, preorder, and postorder traversal. Can someone explain with a simple example? I have an exam tomorrow and this concept is really confusing me.",
    status: 'open',
    course: 'CS 201 - Data Structures',
    isUrgent: true,
    author: mockUsers[0],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    responseCount: 3,
    tags: ['Data Structures', 'Algorithms', 'Trees']
  },
  {
    id: '2',
    title: 'Looking for Calculus II study group',
    content: "Anyone interested in forming a study group for the upcoming midterm? I'm particularly weak on integration techniques and series convergence tests.",
    status: 'open',
    course: 'MATH 201 - Calculus II',
    isUrgent: false,
    author: mockUsers[1],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    responseCount: 7,
    tags: ['Calculus', 'Study Group', 'Integration']
  },
  {
    id: '3',
    title: 'Chemistry lab report format question',
    content: "Can someone share a sample Chemistry lab report format? I'm not sure how to structure the discussion section and what level of detail is expected for the analysis portion.",
    status: 'open',
    course: 'CHEM 150 - General Chemistry',
    isUrgent: false,
    author: mockUsers[2],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    responseCount: 12,
    tags: ['Lab Report', 'Chemistry', 'Writing']
  },
  {
    id: '4',
    title: 'Need help understanding probability distributions',
    content: "Need help understanding probability distributions for my Statistics midterm. Specifically confused about when to use normal vs binomial distributions.",
    status: 'completed',
    course: 'STAT 300 - Statistics',
    isUrgent: false,
    author: mockUsers[3],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    responseCount: 8,
    tags: ['Statistics', 'Probability', 'Distributions']
  }
]