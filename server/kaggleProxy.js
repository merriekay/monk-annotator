// Vite dev-server adapter for the shared Kaggle route handlers (see
// server/kaggleRoutes.js for what they actually do). This is what powers
// `npm run dev`; the production equivalent is server/index.js.
import { createKaggleRoutes } from './kaggleRoutes.js'

export function kaggleProxyPlugin(token) {
  const { handleSigners, handleFrame } = createKaggleRoutes(token)

  return {
    name: 'kaggle-fsboard-proxy',
    configureServer(server) {
      if (!token) {
        console.warn(
          '[kaggle-proxy] KAGGLE_API_TOKEN is not set in .env -- /signers.json and /frames/*.jpg will fail',
        )
      }

      server.middlewares.use('/signers.json', handleSigners)
      server.middlewares.use('/frames', handleFrame)
    },
  }
}
