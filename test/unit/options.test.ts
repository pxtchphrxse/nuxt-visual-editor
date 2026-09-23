// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME,
  DEFAULT_TOKENS,
  renderContentCss,
  renderThemeCss,
  resolveOptions,
} from '../../src/options'

describe('resolveOptions', () => {
  it('fills defaults', () => {
    expect(resolveOptions({})).toEqual({
      mode: 'editor',
      containerClass: 've-content',
      tokens: DEFAULT_TOKENS,
      theme: DEFAULT_THEME,
      assetsBaseURL: '/_visual-editor',
      migrateV1: true,
      sanitizeDebounceMs: 300,
    })
  })

  it('normalises the assets path and merges tokens/theme', () => {
    const o = resolveOptions({
      mode: 'styles',
      containerClass: 'cms',
      assetsBaseURL: 'static/ve/',
      tokens: { fonts: { display: '"Inter", sans-serif' } },
      theme: { brand: '#ff0000' },
      migrateV1: false,
      sanitizeDebounceMs: 0,
    })
    expect(o.assetsBaseURL).toBe('/static/ve')
    expect(o.tokens.fonts).toEqual({ display: '"Inter", sans-serif' })
    expect(o.tokens.palette).toBe(DEFAULT_TOKENS.palette)
    expect(o.theme.brand).toBe('#ff0000')
    expect(o.theme.link).toBe(DEFAULT_THEME.link)
    expect(o.mode).toBe('styles')
    expect(o.migrateV1).toBe(false)
  })

  it.each([
    [{ mode: 'full' }, '`mode` must be "editor" or "styles"'],
    [{ containerClass: 'has space' }, '`containerClass` must be a CSS identifier'],
    [{ containerClass: '.dotted' }, '`containerClass` must be a CSS identifier'],
    [{ tokens: { fonts: { 'Bad Name': 'serif' } } }, 'Invalid font token "Bad Name"'],
    [{ tokens: { fonts: { ok: 'serif; } body { display:none' } } }, 'Invalid font token "ok"'],
    [{ tokens: { palette: ['red'] } }, 'Palette colours must be hex'],
    [{ theme: { brand: 'url(x)' } }, '`theme.brand` must be a hex colour'],
    [{ assetsBaseURL: '../escape' }, '`assetsBaseURL` must be a plain path'],
    [{ assetsBaseURL: '/a b' }, '`assetsBaseURL` must be a plain path'],
    [{ sanitizeDebounceMs: -1 }, '`sanitizeDebounceMs` must be a non-negative integer'],
    [{ sanitizeDebounceMs: 1.5 }, '`sanitizeDebounceMs` must be a non-negative integer'],
  ])('rejects %j', (options, message) => {
    expect(() => resolveOptions(options as never)).toThrow(message)
  })
})

describe('renderContentCss', () => {
  const base = '.__ve_container__ :where(.pad){padding:0}.__ve_container__{--ve-font-sans:x}'

  it('swaps the sentinel for the container class', () => {
    expect(renderContentCss(base, 'cms', {})).toBe(
      '.cms :where(.pad){padding:0}.cms{--ve-font-sans:x}',
    )
  })

  it('appends font overrides after the defaults', () => {
    expect(renderContentCss(base, 'cms', { display: 'Inter', sans: 'Roboto' })).toBe(
      '.cms :where(.pad){padding:0}.cms{--ve-font-sans:x}\n.cms{--ve-font-display:Inter;--ve-font-sans:Roboto}\n',
    )
  })
})

describe('renderThemeCss', () => {
  it('emits theme variables for the editor and its portals', () => {
    expect(renderThemeCss({ ...DEFAULT_THEME, brand: '#000' })).toMatch(
      /^:where\(\.ve-editor,\.ve-portal\)\{--ve-brand:#000;--ve-link:#2563eb;.*--ve-success:#16a34a\}\n$/,
    )
  })
})
