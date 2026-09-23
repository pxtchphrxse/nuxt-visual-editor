import { describe, expect, it } from 'vitest'
import { addComponent, bgColor, canvas, expectModel, openPanel, style } from './editor'
import { fixtureUrl, hasFixture, openPage } from './page'

describe.skipIf(!hasFixture('styles-only'))('styles-only mode', () => {
  it('server-renders sanitized content inside the configured container', async () => {
    const html = await (await fetch(fixtureUrl('/content', 'styles-only'))).text()
    expect(html).toContain(
      '<div class="article-body" id="rendered"><section data-ve-id="s1" data-ve-v="2" class="pad bg" style="--pad-y: 2rem; --bg: #10b981;">',
    )
    expect(html).not.toMatch(/onerror|javascript:/)

    const page = await openPage('/content', { fixture: 'styles-only' })
    const section = page.locator('#rendered section')
    expect(await style(section, 'padding-top')).toBe('32px')
    expect(await style(section, 'background-color')).toBe(await bgColor(page, '#10b981'))
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined()
  })

  it('leaves host markup outside the container untouched', async () => {
    const page = await openPage('/content', { fixture: 'styles-only' })
    const host = page.locator('.host-paragraph')
    expect(await style(host, 'margin-top')).toBe('16px')
    expect(await style(host, 'box-sizing')).toBe('content-box')
    expect(await style(page.locator('body'), 'margin-top')).toBe('8px')
  })

  it('ships no editor CSS, component or assets', async () => {
    const page = await openPage('/content', { fixture: 'styles-only' })
    const editorRules = await page.evaluate(
      () =>
        Array.from(document.styleSheets)
          .flatMap((s) => Array.from(s.cssRules))
          .filter((r) => r.cssText.includes('.ve-editor')).length,
    )
    expect(editorRules).toBe(0)
    expect(
      (await fetch(fixtureUrl('/_visual-editor/placeholder_image.jpg', 'styles-only'))).status,
    ).toBe(404)
  })

  it('supports trusted HTML and falls back to a div for disallowed wrapper tags', async () => {
    const page = await openPage('/content-options', { fixture: 'styles-only' })
    expect(await page.locator('#trusted').evaluate((el) => el.tagName)).toBe('ARTICLE')
    expect(await page.locator('#trusted [data-raw]').count()).toBe(1)
    expect(await page.locator('#untrusted [data-raw]').count()).toBe(0)
    expect(await page.locator('#untrusted p').textContent()).toBe('Content')
    expect(await page.locator('#bad-tag').evaluate((el) => el.tagName)).toBe('DIV')
    expect(await page.locator('#bad-tag').getAttribute('class')).toBe('article-body')
  })

  it('sanitizes in a Nitro route with the auto-imported utility', async () => {
    const res = await fetch(fixtureUrl('/api/sanitize', 'styles-only'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        html: '<p class="pad" style="--pad-y: 1rem; color: red" onclick="x()">ok</p><script>x()</script>',
      }),
    })
    expect(await res.json()).toEqual({ html: '<p class="pad" style="--pad-y: 1rem;">ok</p>' })
  })
})

describe.skipIf(!hasFixture('base-url'))('app.baseURL and custom options', () => {
  it('serves previews and inserted images below the base URL and assets path', async () => {
    const page = await openPage('editor', { fixture: 'base-url' })
    await page.getByTestId('visual-editor').waitFor()
    const preview = page.getByTestId('library').locator('img').first()
    expect(await preview.getAttribute('src')).toMatch(/^\/admin\/static\/ve\/previews\//)
    await expect
      .poll(() => preview.evaluate((i) => (i as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0)

    await addComponent(page, 'features', '1 image with text')
    const img = canvas(page).locator('img')
    expect(await img.getAttribute('src')).toBe('/admin/static/ve/placeholder_image.jpg')
    await expect
      .poll(() => img.evaluate((i) => (i as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0)
  })

  it('applies the container class, theme, palette, font tokens and debounce', async () => {
    const page = await openPage('editor', { fixture: 'base-url' })
    await page.getByTestId('visual-editor').waitFor()
    expect(await canvas(page).getAttribute('class')).toContain('cms-body')
    // The active category tab is painted with --ve-brand.
    const tab = page.getByTestId('library').getByRole('tab', { selected: true })
    expect(await style(tab, 'background-color')).toBe('rgb(255, 0, 170)')

    await addComponent(page, 'headers', 'Support center')
    await canvas(page).locator('h2').click()
    await openPanel(page, 'color')
    const swatches = await page
      .locator('fieldset[data-var="--bg"] button')
      .evaluateAll((b) => b.map((x) => x.getAttribute('aria-label')))
    expect(swatches).toEqual(['#123456', '#abcdef', 'No colour'])

    await openPanel(page, 'typography')
    await page.locator('select[data-var="--ff"]').selectOption('var(--ve-font-display)')
    expect(await style(canvas(page).locator('h2'), 'font-family')).toBe('Georgia, serif')
    await expectModel(page, (html) => html.includes('--ff: var(--ve-font-display);'))
  })
})

describe.skipIf(!hasFixture('host-tailwind'))('host using Tailwind CSS v4', () => {
  it('keeps host utilities and renders content styles', async () => {
    const page = await openPage('/host', { fixture: 'host-tailwind' })
    const tw = page.locator('#tw')
    expect(await style(tw, 'padding-top')).toBe('16px')
    expect(await style(tw, 'font-weight')).toBe('700')
    expect(await style(tw, 'color')).not.toBe('rgb(0, 0, 0)')
    expect(await style(page.locator('#rendered section'), 'padding-top')).toBe('48px')
  })

  it('runs the editor', async () => {
    const page = await openPage('/editor', { fixture: 'host-tailwind' })
    await page.getByTestId('visual-editor').waitFor()
    await addComponent(page, 'headers', 'Support center')
    await canvas(page).locator('h2').click()
    await openPanel(page, 'spacing')
    await page.locator('select[data-var="--pad-y"]').selectOption('2rem')
    expect(await style(canvas(page).locator('h2'), 'padding-top')).toBe('32px')
  })
})
