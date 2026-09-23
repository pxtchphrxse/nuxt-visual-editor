import { describe, expect, it } from 'vitest'
import { DOC, canvas, expectModel, openEditor } from './editor'

// 1×1 transparent PNG.
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
const PNG = Buffer.from(PNG_B64, 'base64')

describe('images', () => {
  it('replaces an image by upload', async () => {
    const page = await openEditor(DOC)
    const img = canvas(page).locator('img')
    await img.click()
    expect(await page.locator('[data-panel="image"] img').getAttribute('src')).toBe(
      '/_visual-editor/placeholder_image.jpg',
    )
    await page
      .getByTestId('image-file')
      .setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: PNG })
    await expect.poll(() => img.getAttribute('src')).toBe(`data:image/png;base64,${PNG_B64}`)
    await expectModel(page, (html) => html.includes(`src="data:image/png;base64,${PNG_B64}"`))
  })

  it('rejects SVG uploads with an inline error', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('img').click()
    await page.getByTestId('image-file').setInputFiles({
      name: 'x.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg onload="window.__pwned=1"/>'),
    })
    await expect
      .poll(() => page.locator('[data-panel="image"] [role="alert"]').textContent())
      .toBe('Only PNG, JPEG, GIF and WebP images can be uploaded.')
    expect(await canvas(page).locator('img').getAttribute('src')).toBe(
      '/_visual-editor/placeholder_image.jpg',
    )
  })

  it('accepts a dropped image and highlights the drop zone while dragging', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('img').click()
    const zone = page.getByTestId('image-drop')
    await zone.evaluate((el, b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const data = new DataTransfer()
      data.items.add(new File([bytes], 'drop.png', { type: 'image/png' }))
      el.dispatchEvent(
        new DragEvent('dragover', { dataTransfer: data, bubbles: true, cancelable: true }),
      )
    }, PNG_B64)
    expect(await zone.getAttribute('class')).toContain('ve-drop--active')
    await zone.evaluate((el) =>
      el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true })),
    )
    expect(await zone.getAttribute('class')).not.toContain('ve-drop--active')
    await zone.evaluate((el, b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const data = new DataTransfer()
      data.items.add(new File([bytes], 'drop.png', { type: 'image/png' }))
      el.dispatchEvent(
        new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }),
      )
    }, PNG_B64)
    await expect
      .poll(() => canvas(page).locator('img').getAttribute('src'))
      .toMatch(/^data:image\/png;base64,/)
  })

  it('ignores an empty drop', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('img').click()
    await page.getByTestId('image-drop').evaluate((el) =>
      el.dispatchEvent(
        new DragEvent('drop', {
          dataTransfer: new DataTransfer(),
          bubbles: true,
          cancelable: true,
        }),
      ),
    )
    expect(await canvas(page).locator('img').getAttribute('src')).toBe(
      '/_visual-editor/placeholder_image.jpg',
    )
  })

  it('sets an image URL, rejecting unsafe ones', async () => {
    const page = await openEditor(DOC)
    const img = canvas(page).locator('img')
    await img.click()
    await page.getByLabel('Image URL').fill('javascript:alert(1)')
    await page.getByLabel('Image URL').press('Enter')
    expect(
      (await page.locator('[data-panel="image"] [role="alert"]').textContent())?.trim(),
    ).toContain('Use an https:// image URL')
    await page.getByLabel('Image URL').fill('/_visual-editor/previews/meet-our-team.png')
    await page.getByLabel('Image URL').press('Enter')
    expect(await img.getAttribute('src')).toBe('/_visual-editor/previews/meet-our-team.png')
    expect(await page.locator('[data-panel="image"] [role="alert"]').count()).toBe(0)
  })

  it('opens the file picker from the button', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('img').click()
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Replace image' }).click()
    await (await chooser).setFiles({ name: 'b.png', mimeType: 'image/png', buffer: PNG })
    await expect
      .poll(() => canvas(page).locator('img').getAttribute('src'))
      .toMatch(/^data:image\/png/)
  })

  it('handles an image without a source', async () => {
    const page = await openEditor(
      '<section data-ve-id="s" data-ve-v="2"><img class="img" alt="Missing"></section>',
    )
    await canvas(page).locator('img').click()
    expect(await page.locator('[data-panel="image"] .ve-drop__preview').count()).toBe(0)
    await page.getByLabel('Image URL').fill('/_visual-editor/placeholder_image.jpg')
    await page.getByLabel('Image URL').press('Enter')
    expect(await page.locator('[data-panel="image"] .ve-drop__preview').count()).toBe(1)
  })

  it('edits and clears alt text', async () => {
    const page = await openEditor(DOC)
    const img = canvas(page).locator('img')
    await img.click()
    await page.getByLabel('Alt text').fill('A mountain')
    await page.getByLabel('Alt text').blur()
    expect(await img.getAttribute('alt')).toBe('A mountain')
    await page.getByLabel('Alt text').fill('')
    await page.getByLabel('Alt text').blur()
    expect(await img.getAttribute('alt')).toBeNull()
  })
})
