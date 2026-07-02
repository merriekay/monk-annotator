import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { kaggleProxyPlugin } from './server/kaggleProxy.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The '' prefix (instead of the default 'VITE_') lets us read
  // KAGGLE_API_TOKEN here without Vite ever exposing it to client code.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), kaggleProxyPlugin(env.KAGGLE_API_TOKEN)],
  }
})
