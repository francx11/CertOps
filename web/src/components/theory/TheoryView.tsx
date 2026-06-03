import { useState } from 'react'
import { ArrowLeft, GraduationCap, Loader2 } from 'lucide-react'
import { useExamContext } from '../../context/ExamContext'
import { useExamEngine } from '../../hooks/useExamEngine'
import DomainList from './DomainList'
import TheoryReader from './TheoryReader'
import type { TheoryDomain } from '../../types'
import { CERT_LABELS } from '../../constants'

const DOMAIN_QUIZ_COUNT = 20

export default function TheoryView() {
  const { state } = useExamContext()
  const { loadAndStart, reset } = useExamEngine()
  const [selectedDomain, setSelectedDomain] = useState<TheoryDomain | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  const cert = state.theoryCert!
  const certLabel = CERT_LABELS[cert] ?? cert

  function handleBack() {
    if (selectedDomain) {
      setSelectedDomain(null)
      setQuizError(null)
    } else {
      reset()
    }
  }

  async function handleStartDomainQuiz() {
    if (!selectedDomain) return
    setQuizLoading(true)
    setQuizError(null)
    try {
      await loadAndStart({
        cert,
        mode: 'quiz',
        count: DOMAIN_QUIZ_COUNT,
        domainNumber: selectedDomain.number,
      })
    } catch {
      setQuizError('Error al cargar las preguntas del dominio')
      setQuizLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <GraduationCap className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 leading-none mb-0.5">
                {certLabel} · Teoría
              </p>
              <p className="text-sm font-semibold text-white truncate leading-none">
                {selectedDomain ? selectedDomain.name : 'Dominios'}
              </p>
            </div>
          </div>

          {quizLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto flex-shrink-0" />
          )}
        </div>

        {quizError && (
          <p className="text-xs text-red-400 px-4 pb-2">{quizError}</p>
        )}
      </header>

      {selectedDomain ? (
        <TheoryReader
          cert={cert}
          domain={selectedDomain}
          onStartQuiz={handleStartDomainQuiz}
        />
      ) : (
        <DomainList cert={cert} onSelect={setSelectedDomain} />
      )}
    </div>
  )
}
