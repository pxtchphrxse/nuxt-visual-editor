import { defineNuxtPlugin } from '#app'
import { initServerSanitizer } from '../server/init-sanitizer'

export default defineNuxtPlugin({
  name: 'nuxt-visual-editor:sanitizer',
  enforce: 'pre',
  setup() {
    initServerSanitizer()
  },
})
