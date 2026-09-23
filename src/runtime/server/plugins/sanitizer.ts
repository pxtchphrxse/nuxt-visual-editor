import { defineNitroPlugin } from '#imports'
import { initServerSanitizer } from '../init-sanitizer'

// Makes `sanitizeVisualContent` usable synchronously from server routes.
export default defineNitroPlugin(() => {
  initServerSanitizer()
})
