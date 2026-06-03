import { useCallback } from 'react'
import { useExamContext, type Answers } from '../context/ExamContext'
import type { ExamConfig, Question, ExamResult, DomainResult } from '../types'

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function checkCorrect(userAnswer: string | string[], correct: string | string[]): boolean {
  if (Array.isArray(correct)) {
    const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    return [...userArr].sort().join(',') === [...correct].sort().join(',')
  }
  return userAnswer === correct
}

function computeResult(questions: Question[], answers: Answers): ExamResult {
  const domainMap = new Map<string, { correct: number; total: number }>()

  const answeredQuestions = questions.map(question => {
    const userAnswer = answers[question.id] ?? ''
    const isCorrect = userAnswer !== '' && checkCorrect(userAnswer, question.correct)

    const d = domainMap.get(question.domain) ?? { correct: 0, total: 0 }
    domainMap.set(question.domain, {
      correct: d.correct + (isCorrect ? 1 : 0),
      total: d.total + 1,
    })

    return { question, userAnswer, isCorrect }
  })

  const domainResults: DomainResult[] = Array.from(domainMap.entries()).map(
    ([domain, { correct, total }]) => ({
      domain,
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
    })
  )

  const score = answeredQuestions.filter(q => q.isCorrect).length

  return {
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    domainResults,
    answeredQuestions,
  }
}

function filterByDomain(questions: Question[], domainNumber: number): Question[] {
  const pattern = new RegExp(`\\bDomain\\s*${domainNumber}\\b`, 'i')
  return questions.filter(q => pattern.test(q.domain))
}

export function useExamEngine() {
  const { state, dispatch } = useExamContext()

  const loadAndStart = useCallback(
    async (config: ExamConfig) => {
      dispatch({ type: 'SET_CONFIG', payload: config })
      const res = await fetch(`/api/questions?cert=${encodeURIComponent(config.cert)}`)
      if (!res.ok) throw new Error(`Error al cargar preguntas para ${config.cert}`)
      const all: Question[] = await res.json()

      const filtered =
        config.domainNumber !== undefined ? filterByDomain(all, config.domainNumber) : all
      const pool = filtered.length > 0 ? filtered : all

      if (pool.length === 0) throw new Error('No hay preguntas disponibles para esta certificación')

      const count = Math.min(config.count, pool.length)
      const shuffled = seededShuffle(pool, Date.now()).slice(0, count)
      dispatch({ type: 'LOAD_QUESTIONS', payload: shuffled })
    },
    [dispatch]
  )

  const enterTheory = useCallback(
    (cert: string) => dispatch({ type: 'ENTER_THEORY', payload: cert }),
    [dispatch]
  )

  const selectAnswer = useCallback(
    (answer: string | string[]) => dispatch({ type: 'SELECT_ANSWER', payload: answer }),
    [dispatch]
  )

  const confirmAnswer = useCallback(
    () => dispatch({ type: 'SHOW_FEEDBACK' }),
    [dispatch]
  )

  const nextQuestion = useCallback(() => {
    const { currentIndex, questions, answers, selectedAnswer } = state
    const q = questions[currentIndex]
    const updated: Answers =
      selectedAnswer !== null ? { ...answers, [q.id]: selectedAnswer } : answers

    if (currentIndex === questions.length - 1) {
      dispatch({ type: 'SUBMIT', payload: computeResult(questions, updated) })
    } else {
      dispatch({ type: 'ADVANCE', payload: updated })
    }
  }, [state, dispatch])

  const submitExam = useCallback(() => {
    const { questions, answers, selectedAnswer, currentIndex } = state
    const q = questions[currentIndex]
    const final: Answers =
      selectedAnswer !== null ? { ...answers, [q.id]: selectedAnswer } : answers
    dispatch({ type: 'SUBMIT', payload: computeResult(questions, final) })
  }, [state, dispatch])

  const previousQuestion = useCallback(() => dispatch({ type: 'BACK' }), [dispatch])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch])

  return {
    state,
    loadAndStart,
    enterTheory,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    previousQuestion,
    submitExam,
    reset,
  }
}
