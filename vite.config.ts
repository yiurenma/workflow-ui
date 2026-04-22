import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from "vite-tsconfig-paths";
import mockServer from 'vite-plugin-mock-dev-server';

const DO_OPERATION = 'https://workflow-operation-api-n9sbp.ondigitalocean.app'
const DO_ONLINE    = 'https://workflow-online-api-nr3e4.ondigitalocean.app'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = mode === 'development' && env.VITE_USE_MOCK !== '0'

  return {
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      tsconfigPaths(),
      useMock && mockServer()
    ].filter(Boolean),
    server: {
      proxy: {
        '/api/proxy/operation': {
          target: DO_OPERATION,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/proxy\/operation/, '/api'),
        },
        '/api/proxy/online': {
          target: DO_ONLINE,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/proxy\/online/, '/api'),
        },
        // Same-origin proxy so GitHub OAuth device flow works in the browser (avoids CORS on github.com).
        '/api/proxy/github': {
          target: 'https://github.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/proxy\/github/, ''),
        },
        // Proxy for GitHub Copilot API.
        '/api/proxy/copilot': {
          target: 'https://api.githubcopilot.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/proxy\/copilot/, ''),
        },
      },
    },
  }
})
