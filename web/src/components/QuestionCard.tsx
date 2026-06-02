import type { Question } from '../types'

interface Props {
  question: Question
  selectedAnswer: string | string[] | null
  onSelect: (answer: string | string[]) => void
  showFeedback?: boolean
}

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

function optionClass(
  key: string,
  selected: string | string[] | null,
  correct: string | string[],
  showFeedback: boolean
): string {
  const isSelected = Array.isArray(selected) ? selected.includes(key) : selected === key
  const isCorrect = Array.isArray(correct) ? correct.includes(key) : correct === key
  const base =
    'flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border transition-colors disabled:cursor-default'

  if (showFeedback) {
    if (isCorrect) return `${base} bg-green-900/40 border-green-600 text-green-200`
    if (isSelected) return `${base} bg-red-900/40 border-red-600 text-red-300`
    return `${base} bg-gray-800/40 border-gray-700 text-gray-500`
  }

  if (isSelected) return `${base} bg-blue-600/20 border-blue-500 text-white`
  return `${base} bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-500 hover:bg-gray-700/50`
}

export default function QuestionCard({ question, selectedAnswer, onSelect, showFeedback = false }: Props) {
  const isMulti = Array.isArray(question.correct)

  function handleClick(key: string) {
    if (showFeedback) return
    if (isMulti) {
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : []
      const next = current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key]
      onSelect(next)
    } else {
      onSelect(key)
    }
  }

  return (
    <div className="space-y-4">
      {isMulti && (
        <p className="text-xs font-medium text-blue-400">
          Selecciona todas las respuestas correctas
        </p>
      )}
      <p className="text-white text-base leading-relaxed">{question.question}</p>

      <div className="space-y-2 pt-2">
        {OPTION_KEYS.filter(k => k in question.options).map(key => (
          <button
            key={key}
            disabled={showFeedback}
            onClick={() => handleClick(key)}
            className={optionClass(key, selectedAnswer, question.correct, showFeedback)}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
              {key}
            </span>
            <span className="text-sm leading-snug">{question.options[key]}</span>
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="mt-2 p-4 bg-gray-800/60 rounded-xl border border-gray-700">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Explicación
          </p>
          <p className="text-sm text-gray-200 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
