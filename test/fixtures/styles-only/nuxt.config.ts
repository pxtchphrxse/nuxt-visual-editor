export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  visualEditor: { mode: 'styles', containerClass: 'article-body' },
  compatibilityDate: '2026-09-01',
})
