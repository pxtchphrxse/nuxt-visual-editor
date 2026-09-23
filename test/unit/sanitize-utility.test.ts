// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

const PAYLOAD = '<p class="pad" style="--pad-y: 1rem;" onclick="x()">ok</p><script>x()</script>'
const CLEAN = '<p class="pad" style="--pad-y: 1rem;">ok</p>'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  delete (globalThis as Record<symbol, unknown>)[Symbol.for('nuxt-visual-editor:server-sanitizer')]
})

describe('sanitizeVisualContent (server)', () => {
  it('throws a helpful error before the server sanitizer is initialised', async () => {
    const { sanitizeVisualContent } = await import('../../src/runtime/sanitize')
    expect(() => sanitizeVisualContent(PAYLOAD)).toThrow('The server sanitizer is not ready')
  })

  it('uses a single jsdom-backed sanitizer once initialised', async () => {
    const { initServerSanitizer } = await import('../../src/runtime/server/init-sanitizer')
    const { sanitizeVisualContent, sanitizeVisualContentDetailed } =
      await import('../../src/runtime/sanitize')
    const a = initServerSanitizer()
    expect(initServerSanitizer()).toBe(a)
    expect(sanitizeVisualContent(PAYLOAD)).toBe(CLEAN)
    const detailed = sanitizeVisualContentDetailed(PAYLOAD)
    expect(detailed.html).toBe(CLEAN)
    expect(detailed.changes.map((c) => c.name)).toEqual(
      expect.arrayContaining(['onclick', 'script']),
    )
    expect(sanitizeVisualContent('<p class="x">a</p>', { allowCustomClasses: false })).toBe(
      '<p>a</p>',
    )
  })
})

describe('sanitizeVisualContent (browser)', () => {
  it('uses the page window and caches the instance', async () => {
    const { JSDOM } = await import('jsdom')
    const { window } = new JSDOM('')
    vi.stubGlobal('window', window)
    const { sanitizeVisualContent } = await import('../../src/runtime/sanitize')
    expect(sanitizeVisualContent(PAYLOAD)).toBe(CLEAN)
    expect(sanitizeVisualContent(PAYLOAD)).toBe(CLEAN)
  })
})
