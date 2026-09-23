import { inputSourcemaps } from '../shared/input-sourcemaps'

export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  visualEditor: { containerClass: 'site-cms' },
  future: { compatibilityVersion: 4 },
  sourcemap: { client: true, server: false },
  vite: { plugins: [inputSourcemaps()] },
  compatibilityDate: '2026-09-01',
})
