import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Loader2, BookX, ClipboardList, List, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useCallback } from 'react'
import type { Components } from 'react-markdown'
import type { TheoryDomain } from '../../types'
import { useTheoryContent } from '../../hooks/useTheory'

interface Props {
  cert: string
  domain: TheoryDomain
  onStartQuiz: () => void
}

interface TocEntry {
  text: string
  id: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function parseToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  for (const line of markdown.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)/)
    if (m) {
      const level = m[1].length
      const raw = m[2]
      const text = raw.replace(/\*\*/g, '').replace(/`/g, '').trim()
      entries.push({ level, text, id: slugify(text) })
    }
  }
  return entries
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

interface TocProps {
  entries: TocEntry[]
}

function TableOfContents({ entries }: TocProps) {
  const [open, setOpen] = useState(true)
  const h2s = entries.filter(e => e.level === 2)

  if (h2s.length === 0) return null

  return (
    <div className="mb-8 rounded-xl border border-gray-700 bg-gray-900/60 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <List className="w-4 h-4 text-blue-400" />
          Índice de contenidos
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-500" />
          : <ChevronDown className="w-4 h-4 text-gray-500" />
        }
      </button>

      {open && (
        <ol className="px-4 pb-4 space-y-1 border-t border-gray-700/60">
          {h2s.map((entry, i) => (
            <li key={entry.id} className="flex items-baseline gap-2 pt-1">
              <span className="text-xs font-mono text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
              <button
                onClick={() => scrollTo(entry.id)}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline text-left transition-colors leading-snug"
              >
                {entry.text}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default function TheoryReader({ cert, domain, onStartQuiz }: Props) {
  const { content, loading, error } = useTheoryContent(cert, domain.slug)

  const toc = content ? parseToc(content) : []

  const components = useCallback((): Components => ({
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-white mt-0 mb-2">{children}</h1>
    ),
    h2: ({ children }) => {
      const text = String(children)
      const id = slugify(text)
      return (
        <h2
          id={id}
          className="text-xl font-bold text-white mt-10 mb-3 pt-4 border-t border-gray-700 scroll-mt-20"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children }) => {
      const text = String(children)
      const id = slugify(text)
      return (
        <h3
          id={id}
          className="text-base font-semibold text-gray-100 mt-6 mb-2 scroll-mt-20"
        >
          {children}
        </h3>
      )
    },
    h4: ({ children }) => (
      <h4 className="text-sm font-semibold text-gray-200 mt-4 mb-1">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-3">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 bg-blue-950/30 rounded-r-lg px-4 py-2 my-4 text-gray-300 italic">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      const isBlock = className?.includes('language-')
      return isBlock ? (
        <code className="block bg-gray-900 border border-gray-700 rounded-lg p-3 text-blue-300 text-xs overflow-x-auto whitespace-pre">
          {children}
        </code>
      ) : (
        <code className="text-blue-300 bg-blue-950/50 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre className="my-4 overflow-x-auto">{children}</pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mb-3 text-gray-300 pl-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-300 pl-2">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-300 leading-relaxed pl-1">{children}</li>
    ),
    hr: () => <hr className="border-gray-700 my-6" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-gray-700">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-800">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-t border-gray-700 even:bg-gray-900/40">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="text-left text-gray-200 font-semibold px-3 py-2 border-r border-gray-700 last:border-r-0 whitespace-nowrap">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="text-gray-300 px-3 py-2 border-r border-gray-700 last:border-r-0 align-top">
        {children}
      </td>
    ),
  }), [])

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
        <TableOfContents entries={toc} />

        <article>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components()}
          >
            {content}
          </ReactMarkdown>
        </article>
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
