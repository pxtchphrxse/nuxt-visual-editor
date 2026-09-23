export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  visualEditor: { containerClass: 'site-cms' },
  compatibilityDate: '2026-09-01',
})
