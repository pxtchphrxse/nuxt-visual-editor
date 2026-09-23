// Non-root base URL plus every customisable option.
import { inputSourcemaps } from '../shared/input-sourcemaps'
export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  app: { baseURL: '/admin/' },
  visualEditor: {
    containerClass: 'cms-body',
    assetsBaseURL: '/static/ve',
    theme: { brand: '#ff00aa' },
    tokens: { fonts: { display: 'Georgia, serif' }, palette: ['#123456', '#abcdef'] },
    sanitizeDebounceMs: 50,
  },
  sourcemap: { client: true, server: false },
  vite: { plugins: [inputSourcemaps()] },
  compatibilityDate: '2026-09-01',
})
