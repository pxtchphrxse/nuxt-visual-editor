import createDOMPurify from 'dompurify'
import {
  createContentSanitizer,
  type ContentSanitizer,
  type SanitizeOptions,
  type SanitizeResult,
} from './core/sanitize'

export type { SanitizeChange, SanitizeOptions, SanitizeResult } from './core/sanitize'

/** Global slot for the server (jsdom) sanitizer, shared by the Vue SSR and Nitro bundles. */
export const SERVER_SANITIZER = Symbol.for('nuxt-visual-editor:server-sanitizer')

type GlobalWithSanitizer = typeof globalThis & { [SERVER_SANITIZER]?: ContentSanitizer }

let browserSanitizer: ContentSanitizer | undefined

function getSanitizer(): ContentSanitizer {
  if (typeof window !== 'undefined' && window.document) {
    browserSanitizer ??= createContentSanitizer(createDOMPurify(window))
    return browserSanitizer
  }
  const server = (globalThis as GlobalWithSanitizer)[SERVER_SANITIZER]
  if (!server) {
    throw new Error(
      "[nuxt-visual-editor] The server sanitizer is not ready. It is initialised by the module's " +
        'Nuxt/Nitro plugins; call `await initServerSanitizer()` first when using it outside a request.',
    )
  }
  return server
}

/**
 * Sanitizes visual-editor HTML with the content policy (allowed tags, safe URLs,
 * vocabulary-only inline styles). Safe to render with `v-html` afterwards.
 */
export function sanitizeVisualContent(html: string, options?: SanitizeOptions): string {
  return getSanitizer()(html, options).html
}

/** Like `sanitizeVisualContent`, but also returns what was removed. */
export function sanitizeVisualContentDetailed(
  html: string,
  options?: SanitizeOptions,
): SanitizeResult {
  return getSanitizer()(html, options)
}
