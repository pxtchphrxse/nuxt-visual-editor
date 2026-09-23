import { describe, expect, it } from 'vitest'
import { DOC, canvas, expectModel, openEditor, sanitizedEvents } from './editor'

const XSS =
  '<section data-ve-id="x" data-ve-v="2" onmouseover="window.__pwned = true">' +
  '<img src="x" onerror="window.__pwned = true">' +
  '<p style="--bg: #fff; background: url(javascript:window.__pwned=true)">text</p>' +
  '<a href="javascript:window.__pwned = true">link</a>' +
  '<script>window.__pwned = true</script>' +
  '<svg onload="window.__pwned = true"></svg>' +
  '<iframe srcdoc="<script>parent.__pwned = true</script>"></iframe></section>'

describe('sanitization', () => {
  it('neutralises malicious v-model content before it reaches the DOM', async () => {
    // The stripped <img src="x"> still requests "x" (404), which is expected here.
    const page = await openEditor(XSS, { allowErrors: [/Failed to load resource.*404/] })
    await canvas(page).locator('p').hover()
    await canvas(page).locator('a').click()
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined()
    const html = (
      await canvas(page)
        .locator('.ve-section__content')
        .evaluateAll((els) => els.map((e) => e.innerHTML))
    ).join('')
    expect(html).not.toMatch(/onerror|onmouseover|onload|javascript:|<script|<svg|<iframe|url\(/i)

    const events = await sanitizedEvents(page)
    const names = events.flat().map((c) => (c as { name: string }).name)
    expect(names).toEqual(
      expect.arrayContaining([
        'onmouseover',
        'onerror',
        'script',
        'svg',
        'iframe',
        'background',
        'href',
      ]),
    )
    await expectModel(page, (h) => !/onerror|javascript:|<script/i.test(h))
  })

  it('sanitizes DOM changes made outside the editor controls (debounced) and re-renders', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    // Simulate a browser extension / devtools injecting into the live canvas.
    await canvas(page)
      .locator('p')
      .first()
      .evaluate((el) => {
        el.setAttribute('onclick', 'window.__pwned = true')
        el.setAttribute('style', 'position: fixed; --fs: 2rem;')
        el.classList.add('fs')
      })
    // Any editor mutation schedules a sync.
    await page.locator('[data-panel="typography"] > button').click()
    await page.locator('select[data-var="--fw"]').selectOption('700')
    await expectModel(page, (html) => !html.includes('onclick') && !html.includes('position'))
    await expect.poll(() => canvas(page).locator('p').first().getAttribute('onclick')).toBeNull()
    expect(await canvas(page).locator('p').first().getAttribute('style')).toBe('--fs: 2rem;')
    const names = (await sanitizedEvents(page)).flat().map((c) => (c as { name: string }).name)
    expect(names).toEqual(expect.arrayContaining(['onclick', 'position']))
    // The injected section was re-rendered, so the selection was cleared.
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(0)
  })

  it('reports nothing for clean content', async () => {
    const page = await openEditor(DOC)
    expect(await sanitizedEvents(page)).toEqual([])
  })
})
