import { describe, expect, it } from 'vitest'
import { isV1Content, migrateV1 } from '../../src/runtime/core/migrate-v1'

function migrateOne(inner: string) {
  const { html, report } = migrateV1(`<section data-componentid="c1">${inner}</section>`)
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return { section: tpl.content.firstElementChild as HTMLElement, report, html }
}

function first(inner: string): HTMLElement {
  return migrateOne(inner).section.firstElementChild as HTMLElement
}

describe('isV1Content', () => {
  it('detects v1 markers', () => {
    expect(isV1Content('<section data-componentid="x"></section>')).toBe(true)
    expect(isV1Content('<section class="py-8"></section>')).toBe(true)
    expect(isV1Content('<section data-ve-v="2"></section>')).toBe(false)
    expect(isV1Content('<p>no sections</p>')).toBe(false)
  })
})

describe('migrateV1', () => {
  it('returns non-v1 content unchanged', () => {
    const html = '<section data-ve-id="a" data-ve-v="2"><p>x</p></section>'
    expect(migrateV1(html)).toEqual({
      html,
      report: { migrated: false, sections: 0, unknownClasses: [] },
    })
  })

  it('renames the id attribute and marks the version', () => {
    const { section, report } = migrateOne('<p>x</p>')
    expect(section.getAttribute('data-ve-id')).toBe('c1')
    expect(section.hasAttribute('data-componentid')).toBe(false)
    expect(section.getAttribute('data-ve-v')).toBe('2')
    expect(report).toEqual({ migrated: true, sections: 1, unknownClasses: [] })
  })

  it('keeps already-migrated sections and sections without legacy ids', () => {
    const { html } = migrateV1(
      '<section data-ve-id="new" data-ve-v="2"><p class="py-8">x</p></section><section><p class="py-8">y</p></section>',
    )
    expect(html).toContain(
      '<section data-ve-id="new" data-ve-v="2"><p class="py-8">x</p></section>',
    )
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    const second = tpl.content.children[1] as HTMLElement
    expect(second.getAttribute('data-ve-v')).toBe('2')
    expect(second.hasAttribute('data-ve-id')).toBe(false)
    const p = second.firstElementChild as HTMLElement
    expect(p.className).toBe('pad')
    expect(p.style.getPropertyValue('--pad-y')).toBe('2rem')
  })

  it.each([
    ['py-8', { '--pad-y': '2rem' }, 'pad'],
    ['px-0.5', { '--pad-x': '0.125rem' }, 'pad'],
    ['p-px', { '--pad-y': '1px', '--pad-x': '1px' }, 'pad'],
    ['p-0', { '--pad-y': '0', '--pad-x': '0' }, 'pad'],
    ['my-4', { '--mar-y': '1rem' }, 'mar'],
    ['mx-auto', { '--mar-x': 'auto' }, 'mar'],
    ['text-4xl', { '--fs': '2.25rem' }, 'fs'],
    ['sm:text-2xl', { '--fs-sm': '1.5rem' }, 'fs'],
    ['md:text-base', { '--fs-md': '1rem' }, 'fs'],
    ['lg:text-9xl', { '--fs-lg': '8rem' }, 'fs'],
    ['text-center', { '--ta': 'center' }, 'ta'],
    ['bg-emerald-500', { '--bg': '#10b981' }, 'bg'],
    ['bg-white', { '--bg': '#ffffff' }, 'bg'],
    ['text-red-600', { '--fg': '#dc2626' }, 'fg'],
    ['border-gray-200', { '--bd-c': '#e5e7eb' }, 'bd'],
    ['bg-opacity-50', { '--bg-a': '0.5' }, 'bg'],
    ['opacity-75', { '--op': '0.75' }, 'op'],
    ['font-bold', { '--fw': '700' }, 'fw'],
    ['font-serif', { '--ff': 'var(--ve-font-serif)' }, 'ff'],
    ['italic', { '--fst': 'italic' }, 'fst'],
    ['not-italic', { '--fst': 'normal' }, 'fst'],
    ['non-italic', { '--fst': 'normal' }, 'fst'],
    ['border', { '--bd-w': '1px' }, 'bd'],
    ['border-4', { '--bd-w': '4px' }, 'bd'],
    ['border-dashed', { '--bd-s': 'dashed' }, 'bd'],
    ['border-hidden', { '--bd-s': 'none' }, 'bd'],
    ['rounded', { '--r': '0.25rem' }, 'rad'],
    ['rounded-full', { '--r': '9999px' }, 'rad'],
    ['rounded-tl-lg', { '--r-tl': '0.5rem' }, 'rad'],
    ['max-w-7xl', { '--max': '80rem' }, 'wrap'],
    ['grid-cols-3', { '--cols': '3' }, 'grid'],
    ['lg:grid-cols-4', { '--cols-lg': '4' }, 'grid'],
    ['md:col-span-2', { '--span-md': '2' }, 'span'],
    ['col-span-8', { '--span': '8' }, 'span'],
    ['gap-8', { '--gap': '2rem' }, undefined],
    ['items-center', { '--align': 'center' }, undefined],
    ['justify-between', { '--justify': 'space-between' }, undefined],
    ['justify-center', { '--justify': 'center' }, undefined],
    ['object-contain', { '--fit': 'contain' }, 'img'],
  ])('maps %s', (cls, vars, expectedClass) => {
    const p = first(`<p class="${cls}">x</p>`)
    const actual = Object.fromEntries(
      Object.keys(vars).map((name) => [name, p.style.getPropertyValue(name)]),
    )
    expect(actual).toEqual(vars)
    expect(p.classList.contains(cls)).toBe(false)
    expect([...p.classList].filter((c) => c === expectedClass)).toEqual(
      expectedClass ? [expectedClass] : [],
    )
  })

  it('maps structural classes', () => {
    expect(first('<div class="grid">x</div>').className).toBe('grid')
    expect(first('<div class="flex">x</div>').className).toBe('row')
    expect(first('<div class="flex flex-col">x</div>').className).toBe('stack')
  })

  it('folds mx-auto into wrap', () => {
    const d = first('<div class="max-w-7xl mx-auto px-6">x</div>')
    expect(d.className).toBe('wrap pad')
    expect(d.style.getPropertyValue('--mar-x')).toBe('')
    expect(d.style.getPropertyValue('--pad-x')).toBe('1.5rem')
  })

  it('keeps and reports unknown classes, drops v1 editor artefacts', () => {
    const { section, report } = migrateOne(
      '<p class="tracking-tight h-7 min-h-[7] text-pink-1000 gap-x bg-mauve-500 py-huge w-full">x</p><p class="w-full">y</p>',
    )
    const p = section.firstElementChild as HTMLElement
    expect(p.className).toBe('tracking-tight text-pink-1000 gap-x bg-mauve-500 py-huge w-full')
    expect(report.unknownClasses).toEqual([
      'bg-mauve-500',
      'gap-x',
      'py-huge',
      'text-pink-1000',
      'tracking-tight',
      'w-full',
    ])
  })

  it('converts v1 inline custom colours', () => {
    const p = first(
      '<p style="background-color: rgb(16, 185, 129); color: rgba(255, 0, 0, 0.5)">x</p>',
    )
    expect(p.style.getPropertyValue('--bg')).toBe('#10b981')
    expect(p.style.getPropertyValue('--fg')).toBe('#ff0000')
    expect(p.className).toBe('bg fg')
    expect(p.style.backgroundColor).toBe('')
  })

  it('keeps inline hex colours (some DOMs do not normalise to rgb)', () => {
    const p = first('<p style="background-color: #abc; color: #FF0000">x</p>')
    expect(p.style.getPropertyValue('--bg')).toBe('#abc')
    expect(p.style.getPropertyValue('--fg')).toBe('#FF0000')
  })

  it('drops unconvertible inline colours and empty style attributes', () => {
    const p = first('<p style="color: hsl(0 0% 0%)">x</p>')
    expect(p.hasAttribute('style')).toBe(false)
    expect(p.hasAttribute('class')).toBe(false)
  })
})
