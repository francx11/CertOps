import { useState, useEffect } from 'react'
import { BookOpen, Zap, ChevronRight, Loader2 } from 'lucide-react'
import type { ExamConfig } from '../types'
import { useExamEngine } from '../hooks/useExamEngine'

const CERT_LABELS: Record<string, string> = {
  'aws-ai-practitioner': 'AWS AI Practitioner',
}

const QUIZ_PRESETS = [10, 20, 30]
const EXAM_PRESETS = [30, 65]

function CountSelector({
  value,
  onChange,
  presets,
}: {
  value: number
  onChange: (n: number) => void
  presets: number[]
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setDraft(e.target.value)
    const n = parseInt(e.target.value)
    if (!isNaN(n) && n >= 1) onChange(n)
  }

  function handleBlur() {
    const n = parseInt(draft)
    if (isNaN(n) || n < 1) setDraft(String(value))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {presets.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              value === n
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        max={500}
        value={draft}
        onChange={handleInput}
        onBlur={handleBlur}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Número personalizado"
      />
    </div>
  )
}

export default function Dashboard() {
  const { loadAndStart } = useExamEngine()
  const [certs, setCerts] = useState<string[]>([])
  const [selectedCert, setSelectedCert] = useState('')
  const [mode, setMode] = useState<'quiz' | 'exam'>('quiz')
  const [quizCount, setQuizCount] = useState(20)
  const [examCount, setExamCount] = useState(65)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/certs')
      .then(r => r.json())
      .then((data: string[]) => {
        setCerts(data)
        if (data.length > 0) setSelectedCert(data[0])
      })
      .catch(() => setError('No se pudieron cargar las certificaciones'))
  }, [])

  async function handleStart() {
    if (!selectedCert) return
    setLoading(true)
    setError(null)
    try {
      const count = mode === 'exam' ? examCount : quizCount
      const config: ExamConfig = { cert: selectedCert, mode, count }
      await loadAndStart(config)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CertOps</h1>
          <p className="text-gray-400 mt-1 text-sm">Plataforma de preparación para certificaciones</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800">
          {/* Cert selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Certificación
            </label>
            {error && !certs.length ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : certs.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </div>
            ) : (
              <select
                value={selectedCert}
                onChange={e => setSelectedCert(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {certs.map(c => (
                  <option key={c} value={c}>
                    {CERT_LABELS[c] ?? c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Modo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('quiz')}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-colors ${
                  mode === 'quiz'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Zap className="w-4 h-4" />
                  Quiz Rápido
                </div>
                <span className="text-xs text-gray-400">Feedback inmediato</span>
              </button>

              <button
                onClick={() => setMode('exam')}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-colors ${
                  mode === 'exam'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <BookOpen className="w-4 h-4" />
                  Examen Real
                </div>
                <span className="text-xs text-gray-400">Sin feedback · al final</span>
              </button>
            </div>
          </div>

          {/* Question count */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Número de preguntas
            </label>
            {mode === 'quiz' ? (
              <CountSelector value={quizCount} onChange={setQuizCount} presets={QUIZ_PRESETS} />
            ) : (
              <CountSelector value={examCount} onChange={setExamCount} presets={EXAM_PRESETS} />
            )}
          </div>

          {error && certs.length > 0 && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleStart}
            disabled={loading || !selectedCert}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Comenzar
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
