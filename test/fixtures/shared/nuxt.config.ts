// Shared layer: every fixture renders the same pages and server routes.
// `srcDir` is explicit so Nuxt 3 (compatibilityVersion 4) and Nuxt 4 both read `app/`.
export default defineNuxtConfig({
  srcDir: 'app',
})
