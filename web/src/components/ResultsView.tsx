import { useState } from 'react'
import { Trophy, TrendingUp, AlertCircle, RefreshCcw } from 'lucide-react'
import { useExamEngine } from '../hooks/useExamEngine'
import type { AnsweredQuestion } from '../types'

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

function FailedQuestion({ item, index }: { item: AnsweredQuestion; index: number }) {
  const [open, setOpen] = useState(false)
  const correctLabel = Array.isArray(item.question.correct)
    ? item.question.correct.join(', ')
    : item.question.correct

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <span className="flex-shrink-0 text-xs font-mono text-gray-500 mt-0.5 w-5 text-right">
          {index + 1}
        </span>
        <p className="text-sm text-gray-200 flex-1 leading-snug line-clamp-2">
          {item.question.question}
        </p>
        <span className="flex-shrink-0 text-gray-500 text-xs mt-0.5">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700/60">
          <div className="mt-3 space-y-1.5">
            {OPTION_KEYS.filter(k => k in item.question.options).map(key => {
              const isCorrect = Array.isArray(item.question.correct)
                ? item.question.correct.includes(key)
                : item.question.correct === key
              const wasSelected = Array.isArray(item.userAnswer)
                ? item.userAnswer.includes(key)
                : item.userAnswer === key

              return (
                <div
                  key={key}
                  className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                    isCorrect
                      ? 'bg-green-900/30 text-green-300'
                      : wasSelected
                      ? 'bg-red-900/30 text-red-300'
                      : 'text-gray-500'
                  }`}
                >
                  <span className="font-bold flex-shrink-0">{key}.</span>
                  <span className="flex-1">{item.question.options[key]}</span>
                  {isCorrect && <span className="flex-shrink-0">✓</span>}
                  {wasSelected && !isCorrect && <span className="flex-shrink-0">✗</span>}
                </div>
              )
            })}
          </div>
          <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700">
            <p className="text-xs font-semibold text-gray-400 mb-1">
              Correcta: <span className="text-green-400">{correctLabel}</span>
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">{item.question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResultsView() {
  const { state, reset } = useExamEngine()
  const { result, config } = state

  if (!result || !config) return null

  const passed = result.percentage >= 70
  const isExam = config.mode === 'exam'
  const failed = result.answeredQuestions.filter(q => !q.isCorrect)

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Score card */}
        <div
          className={`rounded-2xl p-8 text-center border ${
            passed ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
          }`}
        >
          <div className="flex justify-center mb-4">
            <Trophy className={`w-12 h-12 ${passed ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <div className={`text-6xl font-bold mb-1 ${passed ? 'text-green-300' : 'text-red-300'}`}>
            {result.percentage}%
          </div>
          <p className="text-gray-300 text-sm">
            {result.score} de {result.total} correctas
          </p>
          {isExam && (
            <div
              className={`mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {passed ? '✓ APROBADO' : '✗ REPROBADO'}
            </div>
          )}
        </div>

        {/* Domain breakdown */}
        {result.domainResults.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-gray-200">Rendimiento por dominio</h2>
            </div>
            <div className="space-y-4">
              {result.domainResults.map(d => (
                <div key={d.domain}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-300">{d.domain}</span>
                    <span className="text-gray-400 font-mono">
                      {d.correct}/{d.total} · {d.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d.percentage >= 70
                          ? 'bg-green-500'
                          : d.percentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed questions review */}
        {failed.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-gray-200">
                Preguntas falladas ({failed.length})
              </h2>
            </div>
            <div className="space-y-2">
              {failed.map((item, i) => (
                <FailedQuestion key={item.question.id} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-3 rounded-xl border border-gray-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
