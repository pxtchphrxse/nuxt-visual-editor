import { describe, expect, it } from 'vitest'
import { DOC, canvas, expectModel, openEditor, openPanel } from './editor'

describe('text', () => {
  it('edits text with line breaks and never interprets markup', async () => {
    const page = await openEditor(DOC)
    const p = canvas(page).locator('p').first()
    await p.click()
    const textarea = page.locator('[data-panel="text"] textarea')
    expect(await textarea.inputValue()).toBe('First paragraph')
    await textarea.fill('Line one\nLine <img src=x onerror="window.__pwned = true">')
    expect(await p.innerHTML()).toBe(
      'Line one<br>Line &lt;img src=x onerror="window.__pwned = true"&gt;',
    )
    await expectModel(page, (html) =>
      html.includes('<p>Line one<br>Line &lt;img src=x onerror="window.__pwned = true"&gt;</p>'),
    )
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined()
  })

  it('is not offered for elements that contain other elements', async () => {
    const page = await openEditor(DOC)
    await canvas(page)
      .locator('.stack')
      .click({ position: { x: 2, y: 2 } })
    expect(await page.locator('[data-panel="text"]').count()).toBe(0)
  })
})

describe('links', () => {
  it('adds, updates, opens in a new tab and removes a link', async () => {
    const page = await openEditor(DOC)
    const p = canvas(page).locator('p').first()
    await p.click()
    await openPanel(page, 'link')
    await page.getByLabel('Link this text').click()
    await page.getByLabel('URL', { exact: true }).fill('https://example.com')
    await page.getByRole('button', { name: 'Apply link' }).click()
    expect(await p.innerHTML()).toBe('<a href="https://example.com">First paragraph</a>')

    await page.getByLabel('Open in new tab').click()
    await expect
      .poll(() => p.innerHTML())
      .toBe(
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer">First paragraph</a>',
      )

    await page.getByLabel('URL', { exact: true }).fill('/relative/page')
    await page.getByLabel('URL', { exact: true }).press('Enter')
    expect(await p.locator('a').getAttribute('href')).toBe('/relative/page')
    await expectModel(page, (html) =>
      html.includes('href="/relative/page" target="_blank" rel="noopener noreferrer"'),
    )

    await page.getByLabel('Link this text').click()
    await expect.poll(() => p.innerHTML()).toBe('First paragraph')
    await expectModel(page, (html) => !html.includes('<a '))
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example',
    'vbscript:x',
  ])('rejects %s', async (href) => {
    const page = await openEditor(DOC)
    await canvas(page).locator('p').first().click()
    await openPanel(page, 'link')
    await page.getByLabel('Link this text').click()
    await page.getByLabel('URL', { exact: true }).fill(href)
    await page.getByRole('button', { name: 'Apply link' }).click()
    expect(
      (await page.locator('[data-panel="link"] [role="alert"]').textContent())?.trim(),
    ).toContain('Use an http(s), mailto: or tel: link')
    expect(await canvas(page).locator('a').count()).toBe(0)
    expect(await page.getByLabel('URL', { exact: true }).getAttribute('aria-invalid')).toBe('true')
  })

  it('is only offered for text elements', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('img').click()
    expect(await page.locator('[data-panel="link"]').count()).toBe(0)
  })
})
