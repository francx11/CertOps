import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Loader2, BookX, ClipboardList } from 'lucide-react'
import type { TheoryDomain } from '../../types'
import { useTheoryContent } from '../../hooks/useTheory'

interface Props {
  cert: string
  domain: TheoryDomain
  onStartQuiz: () => void
}

export default function TheoryReader({ cert, domain, onStartQuiz }: Props) {
  const { content, loading, error } = useTheoryContent(cert, domain.slug)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Cargando contenido...</span>
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

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
        <div className="overflow-x-auto">
          <article className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-code:text-blue-300 prose-code:bg-blue-950/50 prose-code:px-1 prose-code:rounded
            prose-blockquote:border-blue-600 prose-blockquote:text-gray-400 prose-blockquote:bg-blue-950/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            prose-table:text-sm prose-table:border-collapse
            prose-th:bg-gray-800 prose-th:text-gray-200 prose-th:px-3 prose-th:py-2 prose-th:border prose-th:border-gray-700
            prose-td:text-gray-300 prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-gray-700
            prose-tr:even:bg-gray-900/50
            prose-li:text-gray-300
            prose-hr:border-gray-700
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onStartQuiz}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            Hacer test — Dominio {domain.number}
          </button>
        </div>
      </div>
    </>
  )
}
