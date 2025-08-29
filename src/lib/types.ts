export type QuestionStatus = 'open' | 'in-progress' | 'completed' | 'closed'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  major?: string
  graduationYear?: number
}

export interface Question {
  id: string
  title: string
  content: string
  status: QuestionStatus
  course?: string
  isUrgent: boolean
  author: User
  createdAt: Date
  updatedAt: Date
  responseCount: number
  tags: string[]
}

export interface Response {
  id: string
  content: string
  questionId: string
  author: User
  createdAt: Date
  isAccepted?: boolean
}
