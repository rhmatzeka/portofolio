import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)

const devApiPlugin = () => ({
  name: 'dev-api-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const cleanUrl = req.url?.split('?')[0] || ''

      if (!cleanUrl.startsWith('/api/')) {
        next()
        return
      }

      const routeName = cleanUrl.slice('/api/'.length)
      if (!routeName || routeName.includes('/')) {
        next()
        return
      }

      const handlerPath = path.resolve(process.cwd(), 'api', `${routeName}.js`)
      if (!existsSync(handlerPath)) {
        next()
        return
      }

      try {
        delete require.cache[require.resolve(handlerPath)]
        const handler = require(handlerPath)
        await handler(req, res)
      } catch (error) {
        if (!res.writableEnded) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Local API handler failed.' }))
        }
      }
    })
  }
})

export default defineConfig({
  plugins: [react(), devApiPlugin()],
})
