import { resolve } from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const certsRoot = resolve(process.cwd(), '..', 'certifications')

function extractH1(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ''
}

function parseDomainNumber(filename: string): number {
  const match = filename.match(/^domain_(\d+)_/)
  return match ? parseInt(match[1]) : 0
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'certifications-api',
      configureServer(server) {
        server.middlewares.use('/api/certs', (_req, res) => {
          try {
            const entries = fs.readdirSync(certsRoot, { withFileTypes: true })
            const certs = entries
              .filter(e => e.isDirectory())
              .filter(e => fs.existsSync(resolve(certsRoot, e.name, 'questions.json')))
              .map(e => e.name)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(certs))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to list certifications' }))
          }
        })

        server.middlewares.use('/api/questions', (req, res) => {
          const raw = req.url ?? ''
          const search = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
          const cert = new URLSearchParams(search).get('cert')
          if (!cert) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'cert parameter required' }))
            return
          }
          const qPath = resolve(certsRoot, cert, 'questions.json')
          if (!fs.existsSync(qPath)) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: `Not found: ${cert}` }))
            return
          }
          try {
            const data = fs.readFileSync(qPath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read questions' }))
          }
        })

        server.middlewares.use('/api/theory', (req, res) => {
          const raw = req.url ?? ''
          const isContent = raw.startsWith('/content')
          const search = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
          const params = new URLSearchParams(search)
          const cert = params.get('cert')

          if (!cert) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'cert parameter required' }))
            return
          }

          if (isContent) {
            const slug = params.get('slug')
            if (!slug) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'slug parameter required' }))
              return
            }
            const filePath = resolve(certsRoot, cert, 'theory', `${slug}.md`)
            if (!fs.existsSync(filePath)) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: `Theory file not found: ${slug}` }))
              return
            }
            try {
              const content = fs.readFileSync(filePath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ content }))
            } catch {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to read theory content' }))
            }
            return
          }

          const theoryDir = resolve(certsRoot, cert, 'theory')
          if (!fs.existsSync(theoryDir)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify([]))
            return
          }
          try {
            const files = fs.readdirSync(theoryDir)
              .filter(f => /^domain_\d+_.+\.md$/.test(f))
              .sort()

            const domains = files.map(filename => {
              const number = parseDomainNumber(filename)
              const slug = filename.replace(/\.md$/, '')
              const filePath = resolve(theoryDir, filename)
              const fileContent = fs.readFileSync(filePath, 'utf-8')
              const name = extractH1(fileContent) || slug
              return { slug, name, number, filename }
            })

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(domains))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to list theory domains' }))
          }
        })
      },
    },
  ],
})
