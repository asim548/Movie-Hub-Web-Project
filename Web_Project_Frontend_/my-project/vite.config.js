import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Fail fast on Vercel when the production bundle would embed no API URL
  if (
    mode === 'production' &&
    process.env.VERCEL &&
    !String(process.env.VITE_API_URL ?? '').trim()
  ) {
    throw new Error(
      'Missing VITE_API_URL: add it under Vercel → moviehub → Settings → Environment Variables (Production), then redeploy.'
    )
  }

  return {
    plugins: [react()],
  }
})
