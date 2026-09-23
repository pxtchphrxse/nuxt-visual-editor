export default defineNuxtConfig({
  extends: ['../shared'],
  modules: ['nuxt-visual-editor'],
  visualEditor: { containerClass: 'site-cms' },
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2026-09-01',
})
