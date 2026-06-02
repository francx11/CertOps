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
export type QuizLength = 10 | 20 | 30 | 65

export interface ExamConfig {
  cert: string
  mode: QuizMode
  count: QuizLength
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

export type AppScreen = 'dashboard' | 'quiz' | 'results'
