import { ChevronRight, Loader2, BookX } from 'lucide-react'
import type { TheoryDomain } from '../../types'
import { useTheoryDomains } from '../../hooks/useTheory'

const DOMAIN_STYLES = [
  'border-blue-700 hover:border-blue-500 hover:bg-blue-900/20 text-blue-400',
  'border-purple-700 hover:border-purple-500 hover:bg-purple-900/20 text-purple-400',
  'border-emerald-700 hover:border-emerald-500 hover:bg-emerald-900/20 text-emerald-400',
  'border-amber-700 hover:border-amber-500 hover:bg-amber-900/20 text-amber-400',
  'border-rose-700 hover:border-rose-500 hover:bg-rose-900/20 text-rose-400',
]

interface Props {
  cert: string
  onSelect: (domain: TheoryDomain) => void
}

export default function DomainList({ cert, onSelect }: Props) {
  const { domains, loading, error } = useTheoryDomains(cert)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Cargando dominios...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
        <BookX className="w-8 h-8" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
        <BookX className="w-8 h-8" />
        <p className="text-sm">No hay contenido teórico disponible para esta certificación</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
      <p className="text-sm text-gray-400 mb-6">
        Selecciona un dominio para estudiar su contenido teórico
      </p>
      {domains.map((domain, i) => (
        <button
          key={domain.slug}
          onClick={() => onSelect(domain)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border bg-gray-900/50 transition-all duration-150 ${DOMAIN_STYLES[i % DOMAIN_STYLES.length]}`}
        >
          <span
            className="flex-shrink-0 w-9 h-9 rounded-lg border border-current flex items-center justify-center font-bold text-base opacity-80"
          >
            D{domain.number}
          </span>
          <span className="flex-1 text-left text-sm font-medium text-white leading-snug">
            {domain.name}
          </span>
          <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
        </button>
      ))}
    </div>
  )
}
