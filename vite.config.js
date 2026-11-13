import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Serves /api/chat during `npm run dev` and `npm run preview`, using the same
 * handler that runs as a Vercel function in production. Keys are read from
 * .env on the server side and never reach the browser bundle.
 */
function svetiApi(mode) {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  const readJson = (req) =>
    new Promise((resolve) => {
      let raw = ''
      req.on('data', (chunk) => {
        raw += chunk
        if (raw.length > 200_000) req.destroy()
      })
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : null)
        } catch {
          resolve(null)
        }
      })
      req.on('error', () => resolve(null))
    })

  const mount = (server, load) => {
    server.middlewares.use('/api/chat', async (req, res) => {
      try {
        const { handleChat } = await load()
        await handleChat(req, res, req.method === 'POST' ? await readJson(req) : null, env)
      } catch (error) {
        console.error('[sveti] dev api error:', error)
        if (!res.headersSent) res.statusCode = 500
        res.end(JSON.stringify({ error: 'Dev server error.' }))
      }
    })
  }

  return {
    name: 'sveti-api',
    configureServer: (server) => mount(server, () => server.ssrLoadModule('/server/chat.js')),
    configurePreviewServer: (server) => mount(server, () => import('./server/chat.js')),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), svetiApi(mode)],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
}))
