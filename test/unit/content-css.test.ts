// @vitest-environment node
import { readFileSync } from 'node:fs'
import { parse } from 'postcss'
import { beforeAll, describe, expect, it } from 'vitest'
import { CONTAINER_SENTINEL, assertScoped, compileContentCss } from '../../build/content-css'
import { BREAKPOINTS, STYLE_VARS, VOCABULARY_CLASSES } from '../../src/runtime/core/schema'

let css = ''
beforeAll(async () => {
  css = await compileContentCss()
})

describe('content.css', () => {
  it('implements every vocabulary class and variable', () => {
    for (const cls of VOCABULARY_CLASSES) expect(css, cls).toContain(`:where(.${cls})`)
    for (const name of Object.keys(STYLE_VARS)) {
      expect(css, name).toContain(`var(${name}`)
      expect(css, `${name} reset`).toContain(`${name}:initial`)
    }
  })

  it('uses the schema breakpoints', () => {
    const queries = [...new Set(css.match(/@media \(min-width:\d+px\)/g))]
    expect(queries).toEqual(Object.values(BREAKPOINTS).map((px) => `@media (min-width:${px}px)`))
    const scss = readFileSync(
      new URL('../../src/styles/_breakpoints.scss', import.meta.url),
      'utf8',
    )
    for (const [name, px] of Object.entries(BREAKPOINTS)) expect(scss).toContain(`${name}: ${px}px`)
  })

  it('scopes every rule under the container sentinel', () => {
    expect(() => assertScoped(parse(css))).not.toThrow()
    expect(css.startsWith(CONTAINER_SENTINEL)).toBe(true)
    expect(css).not.toMatch(/(^|})\s*(html|body|:root|\*|a|img)\s*[{,]/)
  })

  it('rejects unscoped selectors', () => {
    expect(() => assertScoped(parse(`${CONTAINER_SENTINEL} p{} body{}`))).toThrow(
      'Unscoped selector in content CSS: "body"',
    )
  })

  it('declares font tokens on the container', () => {
    expect(css).toMatch(/--ve-font-sans:[^;]+;--ve-font-serif:[^;]+;--ve-font-mono:/)
  })

  it('is small', () => {
    expect(css.length).toBeLessThan(6_000)
  })
})
