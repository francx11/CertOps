import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { Question, ExamConfig, ExamResult, AppScreen } from '../types'

export type Answers = Record<string, string | string[]>

interface ExamState {
  screen: AppScreen
  config: ExamConfig | null
  questions: Question[]
  currentIndex: number
  answers: Answers
  selectedAnswer: string | string[] | null
  showFeedback: boolean
  result: ExamResult | null
}

type ExamAction =
  | { type: 'SET_CONFIG'; payload: ExamConfig }
  | { type: 'LOAD_QUESTIONS'; payload: Question[] }
  | { type: 'SELECT_ANSWER'; payload: string | string[] }
  | { type: 'SHOW_FEEDBACK' }
  | { type: 'ADVANCE'; payload: Answers }
  | { type: 'SUBMIT'; payload: ExamResult }
  | { type: 'RESET' }

const initialState: ExamState = {
  screen: 'dashboard',
  config: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  selectedAnswer: null,
  showFeedback: false,
  result: null,
}

function reducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload }

    case 'LOAD_QUESTIONS':
      return {
        ...state,
        questions: action.payload,
        screen: 'quiz',
        currentIndex: 0,
        answers: {},
        selectedAnswer: null,
        showFeedback: false,
        result: null,
      }

    case 'SELECT_ANSWER':
      return { ...state, selectedAnswer: action.payload }

    case 'SHOW_FEEDBACK': {
      if (state.selectedAnswer === null) return state
      const q = state.questions[state.currentIndex]
      return {
        ...state,
        answers: { ...state.answers, [q.id]: state.selectedAnswer },
        showFeedback: true,
      }
    }

    case 'ADVANCE':
      return {
        ...state,
        answers: action.payload,
        currentIndex: state.currentIndex + 1,
        selectedAnswer: null,
        showFeedback: false,
      }

    case 'SUBMIT':
      return { ...state, result: action.payload, screen: 'results' }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

interface ExamContextValue {
  state: ExamState
  dispatch: Dispatch<ExamAction>
}

const ExamContext = createContext<ExamContextValue | null>(null)

export function ExamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <ExamContext.Provider value={{ state, dispatch }}>{children}</ExamContext.Provider>
}

export function useExamContext() {
  const ctx = useContext(ExamContext)
  if (!ctx) throw new Error('useExamContext must be inside ExamProvider')
  return ctx
}
