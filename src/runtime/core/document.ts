// DOM operations on live editor content. Everything here works on a single element tree and
// never queries `document` globally, so several editors can share a page.
import {
  CLASS_OF_VAR,
  CLASS_VARS,
  CONTENT_VERSION,
  CLASS_NAME,
  SECTION_ID_ATTR,
  SECTION_VERSION_ATTR,
  STYLE_VARS,
  VOCABULARY_CLASSES,
  isValidVarValue,
  type StyleVar,
} from './schema'
import { isSafeUrl } from './url'

/** Attributes the editor adds to live DOM for UI state; never serialized. */
export const EDITOR_ATTRS = ['data-ve-selected', 'data-ve-hovered'] as const

export interface SectionModel {
  id: string
  html: string
}

export function newId(): string {
  const c = globalThis.crypto
  // randomUUID only exists in secure contexts; getRandomValues is available everywhere.
  if (typeof c.randomUUID === 'function') return c.randomUUID()
  const b = c.getRandomValues(new Uint8Array(16))
  b[6] = (b[6]! & 0x0f) | 0x40
  b[8] = (b[8]! & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

// ---------------------------------------------------------------------------------------------
// Style variables
// ---------------------------------------------------------------------------------------------

export type ElementVars = Record<StyleVar, string | null>

export function getVar(el: HTMLElement, name: StyleVar): string | null {
  return el.style.getPropertyValue(name).trim() || null
}

export function readVars(el: HTMLElement): ElementVars {
  const vars = {} as ElementVars
  for (const name of Object.keys(STYLE_VARS) as StyleVar[]) vars[name] = getVar(el, name)
  return vars
}

function tidy(el: HTMLElement) {
  if (!el.getAttribute('style')?.trim()) el.removeAttribute('style')
  if (!el.classList.length) el.removeAttribute('class')
}

/**
 * Sets (or with `null`/'' removes) a vocabulary variable and keeps the owning class in sync:
 * the class is present iff at least one of its variables is set. Returns false for invalid values.
 */
export function setVar(el: HTMLElement, name: StyleVar, value: string | null): boolean {
  if (value === null || value.trim() === '') {
    el.style.removeProperty(name)
  } else {
    if (!isValidVarValue(name, value)) return false
    el.style.setProperty(name, value.trim())
  }
  const cls = CLASS_OF_VAR[name]
  if (cls)
    el.classList.toggle(
      cls,
      CLASS_VARS[cls].some((v) => getVar(el, v) !== null),
    )
  tidy(el)
  return true
}

// ---------------------------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------------------------

export function customClasses(el: Element): string[] {
  return [...el.classList].filter((c) => !VOCABULARY_CLASSES.includes(c))
}

export type ClassResult = 'ok' | 'invalid' | 'reserved' | 'exists'

export function addClass(el: HTMLElement, cls: string): ClassResult {
  const name = cls.trim()
  if (!CLASS_NAME.test(name)) return 'invalid'
  if (VOCABULARY_CLASSES.includes(name)) return 'reserved'
  if (el.classList.contains(name)) return 'exists'
  el.classList.add(name)
  return 'ok'
}

export function removeClass(el: HTMLElement, cls: string): void {
  if (VOCABULARY_CLASSES.includes(cls)) return
  el.classList.remove(cls)
  tidy(el)
}

// ---------------------------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------------------------

const TEXT_TAGS = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'SPAN',
  'LI',
  'BLOCKQUOTE',
  'FIGCAPTION',
  'SMALL',
  'STRONG',
  'EM',
  'B',
  'I',
  'U',
  'S',
  'SUB',
  'SUP',
  'A',
])
const LINKABLE_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'LI'])

function isInlineText(node: Node, allowLink: boolean): boolean {
  if (node.nodeType === 3) return true
  if (node.nodeType !== 1) return node.nodeType === 8
  const el = node as Element
  if (el.tagName === 'BR') return true
  if (el.tagName === 'A' && allowLink)
    return [...el.childNodes].every((n) => isInlineText(n, false))
  return false
}

/** Elements whose content is plain text (with line breaks and at most a wrapping link). */
export function isTextElement(el: Element): boolean {
  return (
    TEXT_TAGS.has(el.tagName) &&
    [...el.childNodes].every((n) => isInlineText(n, el.tagName !== 'A'))
  )
}

export function getText(el: Element): string {
  let text = ''
  for (const node of el.childNodes) {
    if (node.nodeType === 3) text += (node as Text).data
    else if ((node as Element).tagName === 'BR') text += '\n'
    else if ((node as Element).tagName === 'A') text += getText(node as Element)
  }
  return text
}

/** Replaces text content using text nodes and <br>, never innerHTML. Keeps a wrapping link. */
export function setText(el: HTMLElement, text: string): void {
  const target = el.querySelector<HTMLElement>(':scope > a') ?? el
  const doc = el.ownerDocument
  const nodes: Node[] = []
  text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .forEach((line, i) => {
      if (i > 0) nodes.push(doc.createElement('br'))
      if (line) nodes.push(doc.createTextNode(line))
    })
  target.replaceChildren(...nodes)
}

// ---------------------------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------------------------

export interface LinkState {
  href: string
  newTab: boolean
}

export function canHaveLink(el: Element): boolean {
  return LINKABLE_TAGS.has(el.tagName) && !el.parentElement?.closest('a') && isTextElement(el)
}

export function getLink(el: Element): LinkState | null {
  const a = el.querySelector(':scope > a')
  return a
    ? { href: a.getAttribute('href') ?? '', newTab: a.getAttribute('target') === '_blank' }
    : null
}

export function setLink(el: HTMLElement, link: LinkState): boolean {
  if (!canHaveLink(el) || !isSafeUrl(link.href, 'link')) return false
  let a = el.querySelector(':scope > a')
  if (!a) {
    a = el.ownerDocument.createElement('a')
    a.append(...el.childNodes)
    el.append(a)
  }
  a.setAttribute('href', link.href.trim())
  if (link.newTab) {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  } else {
    a.removeAttribute('target')
    a.removeAttribute('rel')
  }
  return true
}

export function removeLink(el: Element): void {
  const a = el.querySelector(':scope > a')
  a?.replaceWith(...a.childNodes)
}

// ---------------------------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------------------------

export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const

export function isImage(el: Element): el is HTMLImageElement {
  return el.tagName === 'IMG'
}

export function setImageSrc(el: HTMLImageElement, src: string): boolean {
  if (!isSafeUrl(src, 'image')) return false
  el.setAttribute('src', src)
  return true
}

/** Reads an uploaded image as a data URI. Rejects SVG and other non-raster types. */
export function readImageFile(file: File): Promise<string> {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return Promise.reject(new TypeError(`Unsupported image type "${file.type || 'unknown'}"`))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Could not read file')))
    reader.readAsDataURL(file)
  })
}

// ---------------------------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------------------------

function markSection(section: Element) {
  if (!section.getAttribute(SECTION_ID_ATTR)) section.setAttribute(SECTION_ID_ATTR, newId())
  section.setAttribute(SECTION_VERSION_ATTR, CONTENT_VERSION)
}

/**
 * Splits content into top-level sections. Stray top-level nodes are wrapped in a new section so
 * nothing is lost; sections without an id get one.
 */
export function parseSections(html: string, doc: Document = document): SectionModel[] {
  const tpl = doc.createElement('template')
  tpl.innerHTML = html
  const sections: SectionModel[] = []
  let stray: Node[] = []

  const flush = () => {
    // Only elements and non-blank text count as content; stray comments/whitespace are dropped.
    if (!stray.some((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()))) {
      stray = []
      return
    }
    const section = doc.createElement('section')
    section.append(...stray)
    stray = []
    markSection(section)
    sections.push({ id: section.getAttribute(SECTION_ID_ATTR)!, html: section.outerHTML })
  }

  // Snapshot: flush() moves nodes out of the live NodeList while we iterate.
  // oxlint-disable-next-line unicorn/no-useless-spread
  for (const node of [...tpl.content.childNodes]) {
    if (node.nodeType === 1 && (node as Element).tagName === 'SECTION') {
      flush()
      const section = node as Element
      markSection(section)
      sections.push({ id: section.getAttribute(SECTION_ID_ATTR)!, html: section.outerHTML })
    } else {
      stray.push(node)
    }
  }
  flush()
  return sections
}

/** Instantiates a library component: fresh id, `{{assets}}` resolved to the assets base URL. */
export function instantiateComponent(
  html: string,
  assetsBase: string,
  doc: Document = document,
): SectionModel {
  const withAssets = html.replaceAll('{{assets}}', assetsBase.replace(/\/$/, ''))
  const [first, ...rest] = parseSections(withAssets, doc)
  if (!first || rest.length) throw new Error('A component must contain exactly one root <section>')
  const tpl = doc.createElement('template')
  tpl.innerHTML = first.html
  const section = tpl.content.firstElementChild!
  section.setAttribute(SECTION_ID_ATTR, newId())
  return { id: section.getAttribute(SECTION_ID_ATTR)!, html: section.outerHTML }
}

/** Serializes a live section without editor UI state. */
export function serializeSection(section: Element): string {
  const clone = section.cloneNode(true) as Element
  for (const attr of EDITOR_ATTRS) {
    clone.removeAttribute(attr)
    for (const el of clone.querySelectorAll(`[${attr}]`)) el.removeAttribute(attr)
  }
  return clone.outerHTML
}
