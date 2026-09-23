// The v2 content vocabulary: the only classes and inline custom properties that saved content
// may carry. Editor, sanitizer and v1 migrator all derive their behaviour from this file, and
// src/styles/content/*.scss must implement every class/variable listed here (enforced by tests).

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024 } as const
export type Breakpoint = keyof typeof BREAKPOINTS

type Validator = (value: string) => boolean

const LENGTH = /^(?:0|-?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vh|vw|svh|dvh|ch))$/
const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i

const length: Validator = (v) => LENGTH.test(v) || v === 'auto'
const lengthPair: Validator = (v) => {
  const parts = v.split(' ')
  return parts.length <= 2 && parts.every((p) => LENGTH.test(p))
}
const color: Validator = (v) => HEX.test(v) || v === 'transparent' || v === 'currentColor'
const unit: Validator = (v) => {
  const n = Number(v)
  return v !== '' && Number.isFinite(n) && n >= 0 && n <= 1
}
const integer =
  (min: number, max: number): Validator =>
  (v) => {
    const n = Number(v)
    return /^\d+$/.test(v) && n >= min && n <= max
  }
const oneOf =
  (...values: string[]): Validator =>
  (v) =>
    values.includes(v)
const fontToken: Validator = (v) => /^var\(--ve-font-[a-z][\da-z-]*\)$/.test(v)
const weight: Validator = (v) => /^[1-9]00$/.test(v)

/** Every inline custom property allowed in saved content, with its value validator. */
export const STYLE_VARS = {
  // spacing
  '--pad-y': lengthPair,
  '--pad-x': lengthPair,
  '--mar-y': (v) => lengthPair(v) || v === 'auto',
  '--mar-x': (v) => lengthPair(v) || v === 'auto',
  // colour
  '--bg': color,
  '--bg-a': unit,
  '--fg': color,
  '--op': unit,
  // typography
  '--fs': length,
  '--fs-sm': length,
  '--fs-md': length,
  '--fs-lg': length,
  '--fw': weight,
  '--ff': fontToken,
  '--fst': oneOf('normal', 'italic'),
  '--ta': oneOf('left', 'center', 'right', 'justify'),
  '--lh': (v) => length(v) || /^\d(?:\.\d+)?$/.test(v),
  // border
  '--bd-s': oneOf('solid', 'dashed', 'dotted', 'double', 'none'),
  '--bd-w': length,
  '--bd-c': color,
  '--r': length,
  '--r-tl': length,
  '--r-tr': length,
  '--r-br': length,
  '--r-bl': length,
  // layout
  '--max': length,
  '--gap': length,
  '--cols': integer(1, 12),
  '--cols-sm': integer(1, 12),
  '--cols-md': integer(1, 12),
  '--cols-lg': integer(1, 12),
  '--span': integer(1, 12),
  '--span-md': integer(1, 12),
  '--span-lg': integer(1, 12),
  '--justify': oneOf('start', 'center', 'end', 'space-between'),
  '--align': oneOf('start', 'center', 'end', 'stretch'),
  '--h': length,
  '--fit': oneOf('cover', 'contain'),
} satisfies Record<`--${string}`, Validator>

export type StyleVar = keyof typeof STYLE_VARS

/** Vocabulary classes and the variables each one reads. A class is present iff one of its vars is set. */
export const CLASS_VARS = {
  pad: ['--pad-y', '--pad-x'],
  mar: ['--mar-y', '--mar-x'],
  bg: ['--bg', '--bg-a'],
  fg: ['--fg'],
  op: ['--op'],
  fs: ['--fs', '--fs-sm', '--fs-md', '--fs-lg'],
  fw: ['--fw'],
  ff: ['--ff'],
  fst: ['--fst'],
  ta: ['--ta'],
  lh: ['--lh'],
  bd: ['--bd-s', '--bd-w', '--bd-c'],
  rad: ['--r', '--r-tl', '--r-tr', '--r-br', '--r-bl'],
} as const satisfies Record<string, readonly StyleVar[]>

/** Layout classes used by component markup; they are not toggled by the inspector. */
export const LAYOUT_CLASSES = ['wrap', 'stack', 'row', 'grid', 'span', 'img'] as const

export type VocabularyClass = keyof typeof CLASS_VARS | (typeof LAYOUT_CLASSES)[number]
export const VOCABULARY_CLASSES: readonly string[] = [...Object.keys(CLASS_VARS), ...LAYOUT_CLASSES]

export type EditableClass = keyof typeof CLASS_VARS

export const CLASS_OF_VAR = Object.fromEntries(
  Object.entries(CLASS_VARS).flatMap(([cls, vars]) => vars.map((v) => [v, cls])),
) as Partial<Record<StyleVar, EditableClass>>

export function isStyleVar(name: string): name is StyleVar {
  return Object.hasOwn(STYLE_VARS, name)
}

export function isValidVarValue(name: string, value: string): boolean {
  return isStyleVar(name) && STYLE_VARS[name](value.trim())
}

/** CSS identifiers usable as custom class names or the container class. */
export const CSS_IDENT = /^-?[_a-z][\w-]*$/i

/** Markers written by the editor into saved sections. */
export const SECTION_ID_ATTR = 'data-ve-id'
export const SECTION_VERSION_ATTR = 'data-ve-v'
export const CONTENT_VERSION = '2'
