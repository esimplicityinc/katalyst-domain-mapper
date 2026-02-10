import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/**
 * The @opencode-ai/sdk index.js does `export * from "./server.js"` which imports
 * `node:child_process`. We only use the client-side exports. This plugin intercepts
 * the server.js import and returns an empty stub so the browser build succeeds.
 */
function stubOpencodeServer(): Plugin {
  return {
    name: 'stub-opencode-server',
    enforce: 'pre',
    resolveId(source, importer) {
      // Match both the relative import from within the SDK and the node: protocol
      if (source === 'node:child_process') {
        return '\0virtual:node-child-process'
      }
      if (importer && importer.includes('@opencode-ai') && source.endsWith('server.js')) {
        return '\0virtual:opencode-server-stub'
      }
      return null
    },
    load(id) {
      if (id === '\0virtual:node-child-process') {
        return 'export const spawn = () => { throw new Error("not available in browser"); };'
      }
      if (id === '\0virtual:opencode-server-stub') {
        return 'export function createOpencodeServer() { throw new Error("Server not available in browser"); }'
      }
      return null
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load env from the monorepo root (.env is the single source of truth for ports)
  const rootDir = path.resolve(__dirname, '../..')
  const env = loadEnv(mode, rootDir, '')

  const frontendPort = Number(env.FRONTEND_PORT) || 3000
  const apiPort = Number(env.API_PORT) || 3001

  return {
    plugins: [
      stubOpencodeServer(),
      react(),
    ],
    server: {
      port: frontendPort,
      host: true,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
