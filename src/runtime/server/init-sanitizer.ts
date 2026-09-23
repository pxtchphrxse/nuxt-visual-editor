import createDOMPurify, { type WindowLike } from 'dompurify'
import { JSDOM } from 'jsdom'
import { createContentSanitizer, type ContentSanitizer } from '../core/sanitize'
import { SERVER_SANITIZER } from '../sanitize'

type GlobalWithSanitizer = typeof globalThis & { [SERVER_SANITIZER]?: ContentSanitizer }

/** Creates the jsdom-backed sanitizer once per process. Server-only: never import from client code. */
export function initServerSanitizer(): ContentSanitizer {
  const g = globalThis as GlobalWithSanitizer
  g[SERVER_SANITIZER] ??= createContentSanitizer(
    createDOMPurify(new JSDOM('').window as unknown as WindowLike),
  )
  return g[SERVER_SANITIZER]
}
