import { describe, expect, it } from 'vitest'
import { bgColor, canvas, expectModel, openEditor, style } from './editor'

const V1 =
  '<section data-componentid="legacy-1"><div class="py-8 max-w-7xl mx-auto">' +
  '<h2 class="text-4xl font-bold text-red-600">Legacy</h2>' +
  '<p class="italic tracking-tight" style="background-color: rgb(16, 185, 129)">Old text</p></div></section>'

describe('v1 migration', () => {
  it('converts v1 content on load, reports it and renders it with v2 styles', async () => {
    const page = await openEditor(V1)
    await expectModel(page, (html) =>
      html.startsWith('<section data-ve-id="legacy-1" data-ve-v="2">'),
    )
    const migrated = await page.evaluate(() => window.__ve.migrated.value)
    expect(migrated).toEqual([{ migrated: true, sections: 1, unknownClasses: ['tracking-tight'] }])

    const h2 = canvas(page).locator('h2')
    expect(await style(h2, 'font-size')).toBe('36px')
    expect(await style(h2, 'font-weight')).toBe('700')
    expect(await style(h2, 'color')).toBe('rgb(220, 38, 38)')
    const p = canvas(page).locator('p')
    expect(await style(p, 'font-style')).toBe('italic')
    expect(await style(p, 'background-color')).toBe(await bgColor(page, '#10b981'))
    expect(await p.getAttribute('class')).toContain('tracking-tight')
  })

  it('leaves v2 content alone', async () => {
    const page = await openEditor(
      '<section data-ve-id="v2" data-ve-v="2"><p>Already v2</p></section>',
    )
    expect(await page.evaluate(() => window.__ve.migrated.value)).toEqual([])
  })
})
