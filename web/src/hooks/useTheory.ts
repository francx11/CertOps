import { useState, useEffect } from 'react'
import type { TheoryDomain } from '../types'

export function useTheoryDomains(cert: string) {
  const [domains, setDomains] = useState<TheoryDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/theory?cert=${encodeURIComponent(cert)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: TheoryDomain[]) => {
        setDomains(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Error cargando los dominios de teoría')
        setLoading(false)
      })
  }, [cert])

  return { domains, loading, error }
}

export function useTheoryContent(cert: string, slug: string | null) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setContent('')
      return
    }
    setLoading(true)
    setError(null)
    setContent('')
    fetch(`/api/theory/content?cert=${encodeURIComponent(cert)}&slug=${encodeURIComponent(slug)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { content: string }) => {
        setContent(data.content)
        setLoading(false)
      })
      .catch(() => {
        setError('Error cargando el contenido')
        setLoading(false)
      })
  }, [cert, slug])

  return { content, loading, error }
}
