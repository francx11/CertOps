import { useState } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle, LogOut, FlagTriangleRight, X } from 'lucide-react'
import { useExamEngine } from '../hooks/useExamEngine'
import QuestionCard from './QuestionCard'

interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <p className="text-white text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuizContainer() {
  const { state, selectAnswer, confirmAnswer, nextQuestion, previousQuestion, submitExam, reset } =
    useExamEngine()
  const { config, questions, currentIndex, selectedAnswer, showFeedback } = state

  const [confirmModal, setConfirmModal] = useState<{
    message: string
    onConfirm: () => void
  } | null>(null)

  if (!config || questions.length === 0) return null

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const isFirst = currentIndex === 0
  const isExam = config.mode === 'exam'
  const progress = ((currentIndex + 1) / questions.length) * 100
  const feedbackActive = !isExam && showFeedback
  const canProceed =
    selectedAnswer !== null &&
    (Array.isArray(selectedAnswer) ? selectedAnswer.length > 0 : true)

  function askConfirm(message: string, onConfirm: () => void) {
    setConfirmModal({ message, onConfirm })
  }

  function handlePrimary() {
    if (isExam) {
      nextQuestion()
    } else if (!showFeedback) {
      confirmAnswer()
    } else {
      nextQuestion()
    }
  }

  function buttonLabel() {
    if (isExam) return 'Siguiente'
    if (!showFeedback) return 'Confirmar'
    return isLast ? 'Ver resultados' : 'Continuar'
  }

  function ButtonIcon() {
    if (!isExam && showFeedback && isLast) return <CheckCircle className="w-4 h-4" />
    return <ArrowRight className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={() => {
            confirmModal.onConfirm()
            setConfirmModal(null)
          }}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 truncate max-w-[60%]">
            {question.domain}
          </span>
          <span className="text-xs font-mono text-gray-400 flex-shrink-0">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="h-0.5 bg-gray-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <QuestionCard
          question={question}
          selectedAnswer={selectedAnswer}
          onSelect={selectAnswer}
          showFeedback={feedbackActive}
        />
      </main>

      <footer className="border-t border-gray-800 bg-gray-900/80 backdrop-blur sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Left side */}
          {isExam ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  askConfirm('¿Salir del examen? Perderás tu progreso.', reset)
                }
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-xs font-medium px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
              <button
                onClick={() =>
                  askConfirm(
                    '¿Finalizar el examen ahora? Se calculará tu score con las respuestas dadas.',
                    submitExam
                  )
                }
                className="flex items-center gap-1.5 text-gray-400 hover:text-yellow-400 text-xs font-medium px-3 py-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
              >
                <FlagTriangleRight className="w-3.5 h-3.5" />
                Finalizar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {!isFirst && (
                <button
                  onClick={previousQuestion}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
              )}
              <p className="text-xs text-gray-500">
                {showFeedback
                  ? isLast
                    ? 'Última pregunta'
                    : 'Continúa cuando estés listo'
                  : 'Selecciona tu respuesta'}
              </p>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isExam && !isFirst && (
              <button
                onClick={previousQuestion}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-800 border border-gray-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
            )}
            {isExam && isLast ? (
              <button
                onClick={submitExam}
                disabled={!canProceed}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Enviar examen
              </button>
            ) : (
              <button
                onClick={handlePrimary}
                disabled={!feedbackActive && !canProceed}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                {buttonLabel()}
                <ButtonIcon />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
