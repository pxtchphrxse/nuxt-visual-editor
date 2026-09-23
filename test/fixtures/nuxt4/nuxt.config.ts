import { inputSourcemaps } from '../shared/input-sourcemaps'

export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  visualEditor: { containerClass: 'site-cms' },
  // Source maps (composed with the package's own maps) let e2e coverage resolve to src/.
  sourcemap: { client: true, server: false },
  vite: { plugins: [inputSourcemaps()] },
  compatibilityDate: '2026-09-01',
})
