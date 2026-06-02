import { resolve } from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const certsRoot = resolve(process.cwd(), '..', 'certifications')

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
      },
    },
  ],
})
