// @vitest-environment node
import createDOMPurify, { type WindowLike } from 'dompurify'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES, DEFAULT_COMPONENTS } from '../../src/app/library/default-components'
import { createContentSanitizer } from '../../src/runtime/core/sanitize'
import { VOCABULARY_CLASSES } from '../../src/runtime/core/schema'

const { window } = new JSDOM('')
const sanitize = createContentSanitizer(createDOMPurify(window as unknown as WindowLike))
const ASSETS = '/_visual-editor'

describe('default component library', () => {
  it('keeps the v1 set of 17 components across the default categories', () => {
    expect(DEFAULT_COMPONENTS).toHaveLength(17)
    expect(new Set(DEFAULT_COMPONENTS.map((c) => c.name)).size).toBe(17)
    expect(new Set(DEFAULT_COMPONENTS.map((c) => c.category))).toEqual(new Set(DEFAULT_CATEGORIES))
  })

  it.each(DEFAULT_COMPONENTS.map((c) => [c.name, c] as const))(
    '%s is valid v2 content',
    (_name, component) => {
      const html = component.html.replaceAll('{{assets}}', ASSETS)
      const { html: clean, changes } = sanitize(html)
      expect(changes).toEqual([])
      expect(clean).toBe(html)

      const doc = new JSDOM(`<body>${html}</body>`).window.document
      expect(doc.body.children).toHaveLength(1)
      expect(doc.body.firstElementChild!.tagName).toBe('SECTION')
      const classes = [...doc.body.querySelectorAll('[class]')].flatMap((el) =>
        Array.from(el.classList),
      )
      expect(classes.filter((c) => !VOCABULARY_CLASSES.includes(c))).toEqual([])
      expect(component.preview).toMatch(/^\{\{assets\}\}\/previews\/[\w-]+\.png$/)
    },
  )
})
