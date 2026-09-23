import { describe, expect, it } from 'vitest'
import { isSafeUrl } from '../../src/runtime/core/url'

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

describe('isSafeUrl', () => {
  it.each([
    'https://example.com/a?b=1#c',
    'http://example.com',
    'mailto:hello@example.com',
    'tel:+6612345678',
    '/relative/path',
    '#anchor',
    './page',
    '../up',
    'page.html',
    '?q=1',
  ])('allows link %s', (url) => {
    expect(isSafeUrl(url, 'link')).toBe(true)
  })

  it.each([
    '',
    '   ',
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0001javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    '//evil.example.com',
    'ftp://example.com',
  ])('rejects link %j', (url) => {
    expect(isSafeUrl(url, 'link')).toBe(false)
  })

  it.each([
    'https://cdn.example.com/a.png',
    '/_visual-editor/placeholder.jpg',
    PNG,
    'data:image/jpeg;base64,/9j/4AAQ',
    'data:image/webp;base64,UklGR',
    'data:image/gif;base64,R0lGOD',
  ])('allows image %s', (url) => {
    expect(isSafeUrl(url, 'image')).toBe(true)
  })

  it.each([
    'http://insecure.example.com/a.png',
    'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'data:image/png,notbase64',
    'data:image/png;base64,abc<script>',
    'javascript:alert(1)',
    '//evil.example.com/a.png',
  ])('rejects image %j', (url) => {
    expect(isSafeUrl(url, 'image')).toBe(false)
  })
})
