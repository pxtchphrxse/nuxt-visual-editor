// A host that already uses Tailwind CSS v4 (via @tailwindcss/vite) must keep working unchanged.
import { inputSourcemaps } from '../shared/input-sourcemaps'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  css: ['~/assets/main.css'],
  vite: { plugins: [tailwindcss(), inputSourcemaps()] },
  sourcemap: { client: true, server: false },
  compatibilityDate: '2026-09-01',
})
