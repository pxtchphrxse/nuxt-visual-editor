// Module options: types, validation and generated CSS. Pure functions, unit-tested at 100%.
import { CSS_IDENT } from './runtime/core/schema'

export interface EditorTheme {
  /** Accent for focus rings, selection and primary buttons. */
  brand: string
  /** Links and secondary accents. */
  link: string
  surface: string
  text: string
  muted: string
  border: string
  error: string
  success: string
}

export interface ContentTokens {
  /** Font families referenced by content as `var(--ve-font-<name>)`. */
  fonts: Record<string, string>
  /** Colour swatches offered by the colour pickers (hex). */
  palette: string[]
  /** Spacing scale offered for padding, margin and gaps. */
  spacing: string[]
  /** Font size scale, label -> CSS length. */
  fontSizes: Record<string, string>
}

export interface ModuleOptions {
  /**
   * `editor`: registers `<VisualEditor>` plus everything in `styles`.
   * `styles`: only the content stylesheet, `<VisualEditorContent>` and the sanitize utilities,
   * for sites that render saved content.
   */
  mode: 'editor' | 'styles'
  /** Class of the element that wraps rendered content; every content rule is scoped under it. */
  containerClass: string
  tokens: Partial<ContentTokens>
  theme: Partial<EditorTheme>
  /** Public path for the editor's preview images and placeholder (below `app.baseURL`). */
  assetsBaseURL: string
  /** Convert v1 (Tailwind) content when it is loaded into the editor. */
  migrateV1: boolean
  /** Debounce for sanitizing edits before `update:modelValue` is emitted. */
  sanitizeDebounceMs: number
}

export interface PublicVisualEditorConfig {
  containerClass: string
  assetsBaseURL: string
  migrateV1: boolean
  sanitizeDebounceMs: number
  tokens: Omit<ContentTokens, 'fonts'> & { fonts: string[] }
}

const FONT_NAME = /^[a-z][\da-z-]*$/
// Values end up inside a generated stylesheet; reject anything that could close the declaration.
const SAFE_CSS_VALUE = /^[^;{}<>\\]+$/
const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i

export const DEFAULT_TOKENS: ContentTokens = {
  fonts: {},
  palette: [
    '#ffffff',
    '#f8fafc',
    '#e2e8f0',
    '#94a3b8',
    '#475569',
    '#1e293b',
    '#000000',
    '#fee2e2',
    '#ef4444',
    '#b91c1c',
    '#ffedd5',
    '#f97316',
    '#c2410c',
    '#fef9c3',
    '#eab308',
    '#a16207',
    '#dcfce7',
    '#22c55e',
    '#15803d',
    '#d1fae5',
    '#10b981',
    '#047857',
    '#e0f2fe',
    '#0ea5e9',
    '#0369a1',
    '#dbeafe',
    '#3b82f6',
    '#1d4ed8',
    '#ede9fe',
    '#8b5cf6',
    '#6d28d9',
    '#fce7f3',
    '#ec4899',
    '#be185d',
  ],
  spacing: [
    '0',
    '0.25rem',
    '0.5rem',
    '0.75rem',
    '1rem',
    '1.5rem',
    '2rem',
    '2.5rem',
    '3rem',
    '4rem',
    '5rem',
    '6rem',
    '8rem',
  ],
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
}

export const DEFAULT_THEME: EditorTheme = {
  brand: '#111827',
  link: '#2563eb',
  surface: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  error: '#dc2626',
  success: '#16a34a',
}

export const BUILT_IN_FONTS = ['sans', 'serif', 'mono']

/**
 * The two Nitro options this module sets. Nuxt 4.5 declares `nuxt.options.nitro` through an
 * augmentation in @nuxt/nitro-server (not reachable from a strict install), so it is typed locally.
 */
export interface NitroOptionsSubset {
  externals?: { external?: string[] }
  publicAssets?: Array<{ dir: string; baseURL?: string; maxAge?: number }>
}

/** Validates options and fills defaults. Throws with a readable message on bad input. */
export function resolveOptions(
  options: Partial<ModuleOptions>,
): ModuleOptions & { tokens: ContentTokens; theme: EditorTheme } {
  const mode = options.mode ?? 'editor'
  if (mode !== 'editor' && mode !== 'styles')
    throw new Error(`\`mode\` must be "editor" or "styles", got ${JSON.stringify(mode)}`)
  const containerClass = options.containerClass ?? 've-content'
  if (!CSS_IDENT.test(containerClass))
    throw new Error(
      `\`containerClass\` must be a CSS identifier, got ${JSON.stringify(containerClass)}`,
    )

  const tokens: ContentTokens = { ...DEFAULT_TOKENS, ...options.tokens }
  for (const [name, value] of Object.entries(tokens.fonts)) {
    if (!FONT_NAME.test(name) || !SAFE_CSS_VALUE.test(value))
      throw new Error(`Invalid font token "${name}": ${JSON.stringify(value)}`)
  }
  for (const color of tokens.palette)
    if (!HEX.test(color))
      throw new Error(`Palette colours must be hex, got ${JSON.stringify(color)}`)

  const theme: EditorTheme = { ...DEFAULT_THEME, ...options.theme }
  for (const [key, value] of Object.entries(theme)) {
    if (!HEX.test(value))
      throw new Error(`\`theme.${key}\` must be a hex colour, got ${JSON.stringify(value)}`)
  }

  const assetsBaseURL = `/${(options.assetsBaseURL ?? '/_visual-editor').replace(/^\/+|\/+$/g, '')}`
  if (!/^\/[\w\-./]+$/.test(assetsBaseURL) || assetsBaseURL.includes('..')) {
    throw new Error(
      `\`assetsBaseURL\` must be a plain path, got ${JSON.stringify(options.assetsBaseURL)}`,
    )
  }
  const sanitizeDebounceMs = options.sanitizeDebounceMs ?? 300
  if (!Number.isInteger(sanitizeDebounceMs) || sanitizeDebounceMs < 0)
    throw new Error('`sanitizeDebounceMs` must be a non-negative integer')

  return {
    mode,
    containerClass,
    tokens,
    theme,
    assetsBaseURL,
    migrateV1: options.migrateV1 ?? true,
    sanitizeDebounceMs,
  }
}

/** The shipped content CSS uses a sentinel container class that is swapped for the configured one. */
export function renderContentCss(
  baseCss: string,
  containerClass: string,
  fonts: Record<string, string>,
): string {
  const scoped = baseCss.replaceAll('.__ve_container__', `.${containerClass}`)
  const overrides = Object.entries(fonts).map(([name, value]) => `--ve-font-${name}:${value}`)
  return overrides.length ? `${scoped}\n.${containerClass}{${overrides.join(';')}}\n` : scoped
}

export function renderThemeCss(theme: EditorTheme): string {
  const vars = Object.entries(theme).map(([key, value]) => `--ve-${key}:${value}`)
  return `:where(.ve-editor,.ve-portal){${vars.join(';')}}\n`
}
