// Converts v1 content (Tailwind v3 classes, `data-componentid`) into the v2 vocabulary.
// Runs on an inert <template>, before sanitization, so v1 inline colours can be converted
// instead of being stripped. Unknown classes are kept and reported.
import { CONTENT_VERSION, SECTION_ID_ATTR, SECTION_VERSION_ATTR, type StyleVar } from './schema'
import { setVar } from './document'
import { TAILWIND_V3_COLORS } from './v1/tailwind-colors'

export interface MigrationReport {
  /** True when the input contained v1 content. */
  migrated: boolean
  sections: number
  /** v1 classes with no v2 equivalent; they are kept on the element. */
  unknownClasses: string[]
}

type Vars = Partial<Record<StyleVar, string>>
interface Mapping {
  vars?: Vars
  classes?: string[]
}

const FONT_SIZES: Record<string, string> = {
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
}
const WEIGHTS: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}
const RADII: Record<string, string> = {
  none: '0',
  sm: '0.125rem',
  '': '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}
const MAX_WIDTHS: Record<string, string> = {
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
  '3xl': '48rem',
  '4xl': '56rem',
  '5xl': '64rem',
  '6xl': '72rem',
  '7xl': '80rem',
}

/** Tailwind spacing scale: n → n × 0.25rem, plus `px`. */
function spacing(token: string): string | null {
  if (token === 'px') return '1px'
  if (token === '0') return '0'
  if (!/^\d+(?:\.5)?$/.test(token)) return null
  return `${Number(token) * 0.25}rem`
}

const RESPONSIVE_SUFFIX: Record<string, string> = {
  '': '',
  'sm:': '-sm',
  'md:': '-md',
  'lg:': '-lg',
}

function mapClass(cls: string): Mapping | null {
  let m: RegExpMatchArray | null

  // Spacing (v1 editor: py/px/my/mx; components also used p/m).
  if ((m = cls.match(/^([pm])([xy]?)-(.+)$/))) {
    const [, kind, axis, token] = m
    const value = token === 'auto' && kind === 'm' ? 'auto' : spacing(token!)
    if (value === null) return null
    const base = kind === 'p' ? '--pad' : '--mar'
    const vars: Vars = {}
    if (axis !== 'x') vars[`${base}-y` as StyleVar] = value
    if (axis !== 'y') vars[`${base}-x` as StyleVar] = value
    return { vars }
  }

  // Font sizes, mobile-first responsive.
  if ((m = cls.match(/^(sm:|md:|lg:)?text-(xs|sm|base|lg|[2-9]?xl)$/))) {
    return { vars: { [`--fs${RESPONSIVE_SUFFIX[m[1] ?? '']}` as StyleVar]: FONT_SIZES[m[2]!]! } }
  }
  if ((m = cls.match(/^text-(left|center|right|justify)$/))) return { vars: { '--ta': m[1]! } }

  // Colours (opacity first: `bg-opacity-50` would otherwise look like a colour name).
  if ((m = cls.match(/^bg-opacity-(\d+)$/)))
    return { vars: { '--bg-a': String(Number(m[1]) / 100) } }
  if ((m = cls.match(/^(bg|text|border)-(white|black|[a-z]+-\d{2,3})$/))) {
    const hex = TAILWIND_V3_COLORS[m[2]!]
    if (!hex) return null
    const name = ({ bg: '--bg', text: '--fg', border: '--bd-c' } as const)[
      m[1] as 'bg' | 'text' | 'border'
    ]
    return { vars: { [name]: hex } }
  }
  if ((m = cls.match(/^opacity-(\d+)$/))) return { vars: { '--op': String(Number(m[1]) / 100) } }

  // Font.
  if (
    (m = cls.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/))
  ) {
    return { vars: { '--fw': WEIGHTS[m[1]!]! } }
  }
  if ((m = cls.match(/^font-(sans|serif|mono)$/)))
    return { vars: { '--ff': `var(--ve-font-${m[1]})` } }
  if (cls === 'italic') return { vars: { '--fst': 'italic' } }
  // `non-italic` was a v1 editor bug for Tailwind's `not-italic`.
  if (cls === 'not-italic' || cls === 'non-italic') return { vars: { '--fst': 'normal' } }

  // Borders.
  if (cls === 'border') return { vars: { '--bd-w': '1px' } }
  if ((m = cls.match(/^border-(\d)$/))) return { vars: { '--bd-w': `${m[1]}px` } }
  if ((m = cls.match(/^border-(solid|dashed|dotted|double|none|hidden)$/))) {
    return { vars: { '--bd-s': m[1] === 'hidden' ? 'none' : m[1]! } }
  }
  if ((m = cls.match(/^rounded(?:-(tl|tr|br|bl))?(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$/))) {
    const value = RADII[m[2] ?? '']!
    return { vars: { [m[1] ? `--r-${m[1]}` : '--r']: value } as Vars }
  }

  // Layout.
  if ((m = cls.match(/^max-w-(sm|md|lg|xl|[2-7]xl)$/))) {
    return { classes: ['wrap'], vars: { '--max': MAX_WIDTHS[m[1]!]! } }
  }
  if (cls === 'grid') return { classes: ['grid'] }
  if ((m = cls.match(/^(sm:|md:|lg:)?grid-cols-(\d{1,2})$/))) {
    return {
      classes: ['grid'],
      vars: { [`--cols${RESPONSIVE_SUFFIX[m[1] ?? '']}` as StyleVar]: m[2]! },
    }
  }
  if ((m = cls.match(/^(md:|lg:)?col-span-(\d{1,2})$/))) {
    return {
      classes: ['span'],
      vars: { [`--span${RESPONSIVE_SUFFIX[m[1] ?? '']}` as StyleVar]: m[2]! },
    }
  }
  if ((m = cls.match(/^gap-(.+)$/))) {
    const value = spacing(m[1]!)
    return value === null ? null : { vars: { '--gap': value } }
  }
  if (cls === 'flex') return { classes: ['row'] }
  if (cls === 'flex-col') return { classes: ['stack'] }
  if ((m = cls.match(/^items-(start|center|end|stretch)$/))) return { vars: { '--align': m[1]! } }
  if ((m = cls.match(/^justify-(start|center|end|between)$/))) {
    return { vars: { '--justify': m[1] === 'between' ? 'space-between' : m[1]! } }
  }
  if ((m = cls.match(/^object-(cover|contain)$/)))
    return { classes: ['img'], vars: { '--fit': m[1]! } }

  // v1 editor artefacts on empty text elements (`min-h-[7]` was invalid CSS).
  if (cls === 'min-h-[7]' || cls === 'h-7') return {}
  return null
}

function rgbToHex(value: string): string | null {
  const m = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return /^#[\da-f]{3,8}$/i.test(value) ? value : null
  return `#${m
    .slice(1, 4)
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('')}`
}

function migrateElement(el: HTMLElement, unknown: Set<string>) {
  // v1 custom colours were inline `background-color` / `color` styles.
  const bg = rgbToHex(el.style.backgroundColor)
  const fg = rgbToHex(el.style.color)
  el.style.removeProperty('background-color')
  el.style.removeProperty('color')
  const vars: Vars = {}
  const classes = new Set<string>()
  const kept: string[] = []

  for (const cls of el.classList) {
    const mapping = mapClass(cls)
    if (!mapping) {
      unknown.add(cls)
      kept.push(cls)
      continue
    }
    Object.assign(vars, mapping.vars)
    for (const c of mapping.classes ?? []) classes.add(c)
  }
  // `flex flex-col` is a column stack, not a row.
  if (classes.has('stack')) classes.delete('row')
  // `max-w-* mx-auto` is fully expressed by `wrap`.
  if (classes.has('wrap') && vars['--mar-x'] === 'auto') delete vars['--mar-x']
  if (bg) vars['--bg'] = bg
  if (fg) vars['--fg'] = fg

  el.removeAttribute('class')
  for (const c of [...classes, ...kept]) el.classList.add(c)
  for (const [name, value] of Object.entries(vars)) setVar(el, name as StyleVar, value)
  if (!el.getAttribute('style')?.trim()) el.removeAttribute('style')
}

/** True when any top-level-looking section is still in v1 format. */
export function isV1Content(html: string): boolean {
  return /\sdata-componentid=/.test(html) || /<section\b(?![^>]*\sdata-ve-v=)[^>]*>/i.test(html)
}

export function migrateV1(
  html: string,
  doc: Document = document,
): { html: string; report: MigrationReport } {
  if (!isV1Content(html))
    return { html, report: { migrated: false, sections: 0, unknownClasses: [] } }

  const tpl = doc.createElement('template')
  tpl.innerHTML = html
  const unknown = new Set<string>()
  const sections = [...tpl.content.children].filter((el) => el.tagName === 'SECTION')

  for (const section of sections) {
    if (section.getAttribute(SECTION_VERSION_ATTR) === CONTENT_VERSION) continue
    const legacyId = section.getAttribute('data-componentid')
    section.removeAttribute('data-componentid')
    if (legacyId) section.setAttribute(SECTION_ID_ATTR, legacyId)
    for (const el of [section, ...section.querySelectorAll('*')]) {
      migrateElement(el as HTMLElement, unknown)
    }
    section.setAttribute(SECTION_VERSION_ATTR, CONTENT_VERSION)
  }

  return {
    html: tpl.innerHTML,
    report: { migrated: true, sections: sections.length, unknownClasses: [...unknown].toSorted() },
  }
}
