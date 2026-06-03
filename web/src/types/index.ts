export interface Question {
  id: string
  domain: string
  question: string
  options: Record<string, string>
  correct: string | string[]
  explanation: string
  source: string
  tags: string[]
  added: string
}

export type QuizMode = 'quiz' | 'exam'

export interface ExamConfig {
  cert: string
  mode: QuizMode
  count: number
  domainNumber?: number
}

export interface TheoryDomain {
  slug: string
  name: string
  number: number
  filename: string
}

export interface DomainResult {
  domain: string
  correct: number
  total: number
  percentage: number
}

export interface AnsweredQuestion {
  question: Question
  userAnswer: string | string[]
  isCorrect: boolean
}

export interface ExamResult {
  score: number
  total: number
  percentage: number
  domainResults: DomainResult[]
  answeredQuestions: AnsweredQuestion[]
}

export type AppScreen = 'dashboard' | 'quiz' | 'results' | 'theory'
