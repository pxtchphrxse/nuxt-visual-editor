import type { Config, DOMPurify } from 'dompurify'
import { CSS_IDENT, VOCABULARY_CLASSES, isValidVarValue } from './schema'
import { isSafeUrl } from './url'

export interface SanitizeChange {
  kind: 'element' | 'attribute' | 'style' | 'class'
  /** Tag name, attribute name, custom property or class that was removed. */
  name: string
  /** Tag of the element the change applied to. */
  tag?: string
}

export interface SanitizeResult {
  html: string
  changes: SanitizeChange[]
}

export interface SanitizeOptions {
  /** Keep classes outside the v2 vocabulary (still restricted to valid CSS identifiers). Default: true. */
  allowCustomClasses?: boolean
}

export type ContentSanitizer = (html: string, options?: SanitizeOptions) => SanitizeResult

const ALLOWED_TAGS = [
  'section',
  'div',
  'article',
  'aside',
  'header',
  'footer',
  'nav',
  'main',
  'figure',
  'figcaption',
  'p',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'small',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'sub',
  'sup',
  'br',
  'hr',
  'ul',
  'ol',
  'li',
  'a',
  'img',
]

const ALLOWED_ATTR = [
  'class',
  'style',
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'loading',
  'data-ve-id',
  'data-ve-v',
]

const CONFIG: Config = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

const SECTION_ID = /^[\w-]{1,64}$/

/** Keeps only vocabulary custom properties whose values pass their validator. */
export function filterStyle(style: string): { style: string; dropped: string[] } {
  const kept: string[] = []
  const dropped: string[] = []
  for (const declaration of style.split(';')) {
    if (!declaration.trim()) continue
    const colon = declaration.indexOf(':')
    const name = colon === -1 ? declaration.trim() : declaration.slice(0, colon).trim()
    const value = colon === -1 ? '' : declaration.slice(colon + 1).trim()
    if (colon !== -1 && isValidVarValue(name, value)) kept.push(`${name}: ${value};`)
    else dropped.push(name || declaration.trim())
  }
  return { style: kept.join(' '), dropped }
}

/** Keeps valid CSS identifiers (optionally only vocabulary classes), de-duplicated in order. */
export function filterClasses(
  value: string,
  allowCustom: boolean,
): { value: string; dropped: string[] } {
  const kept: string[] = []
  const dropped: string[] = []
  for (const cls of value.split(/\s+/)) {
    if (!cls || kept.includes(cls)) continue
    if (CSS_IDENT.test(cls) && (allowCustom || VOCABULARY_CLASSES.includes(cls))) kept.push(cls)
    else dropped.push(cls)
  }
  return { value: kept.join(' '), dropped }
}

/**
 * Wraps a DOMPurify instance with the visual-editor content policy.
 * Hooks are registered once per instance, so create one sanitizer per DOMPurify instance.
 */
export function createContentSanitizer(purify: DOMPurify): ContentSanitizer {
  let changes: SanitizeChange[] = []
  let allowCustomClasses = true

  purify.addHook('uponSanitizeAttribute', (node, data) => {
    const tag = node.nodeName.toLowerCase()
    const value = data.attrValue
    switch (data.attrName) {
      case 'style': {
        const { style, dropped } = filterStyle(value)
        for (const name of dropped) changes.push({ kind: 'style', name, tag })
        data.attrValue = style
        if (!style) data.keepAttr = false
        break
      }
      case 'class': {
        const { value: classes, dropped } = filterClasses(value, allowCustomClasses)
        for (const name of dropped) changes.push({ kind: 'class', name, tag })
        data.attrValue = classes
        if (!classes) data.keepAttr = false
        break
      }
      case 'href':
        if (tag !== 'a' || !isSafeUrl(value, 'link')) data.keepAttr = false
        break
      case 'src':
        if (tag !== 'img' || !isSafeUrl(value, 'image')) data.keepAttr = false
        break
      case 'target':
        if (tag !== 'a' || value !== '_blank') data.keepAttr = false
        break
      case 'data-ve-id':
        if (tag !== 'section' || !SECTION_ID.test(value)) data.keepAttr = false
        break
      case 'data-ve-v':
        if (tag !== 'section' || value !== '2') data.keepAttr = false
        break
    }
  })

  // `rel` is always derived from `target`, never taken from the input.
  purify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName !== 'A') {
      node.removeAttribute('rel')
      return
    }
    if (node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer')
    else node.removeAttribute('rel')
  })

  return (html, options = {}) => {
    changes = []
    allowCustomClasses = options.allowCustomClasses ?? true
    const out = purify.sanitize(html, CONFIG) as string
    for (const removed of purify.removed) {
      if ('element' in removed) {
        const name = removed.element.nodeName.toLowerCase()
        // DOMPurify parses fragments into a <body> wrapper and reports it; it is not user content.
        if (name !== 'body') changes.push({ kind: 'element', name })
      } else if (removed.attribute) {
        changes.push({
          kind: 'attribute',
          name: removed.attribute.name,
          tag: removed.from.nodeName.toLowerCase(),
        })
      }
    }
    return { html: out, changes }
  }
}
