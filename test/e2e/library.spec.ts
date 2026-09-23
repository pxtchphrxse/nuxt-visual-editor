import { describe, expect, it } from 'vitest'
import { addComponent, canvas, expectModel, openEditor } from './editor'

describe('component library', () => {
  it('lists every default category and adds components from each', async () => {
    const page = await openEditor()
    const tabs = page.getByTestId('library').getByRole('tab')
    expect(await tabs.allTextContents()).toEqual([
      'headers',
      'features',
      'teams',
      'testimonials',
      'forms',
    ])

    await addComponent(page, 'headers', 'Support center')
    await addComponent(page, 'teams', 'Meet our team')
    await addComponent(page, 'forms', 'Contact left image')
    expect(await canvas(page).locator('.ve-section').count()).toBe(3)
    await expectModel(page, (html) => (html.match(/<section /g) ?? []).length === 3)
  })

  it('loads every preview image', async () => {
    const page = await openEditor()
    for (const tab of await page.getByTestId('library').getByRole('tab').all()) {
      await tab.click()
      for (const img of await page.getByTestId('library').locator('img').all()) {
        await img.scrollIntoViewIfNeeded()
        await expect
          .poll(() => img.evaluate((i) => (i as HTMLImageElement).naturalWidth))
          .toBeGreaterThan(0)
      }
    }
  })
})

describe('custom library', () => {
  it('derives categories from custom components and follows category changes', async () => {
    const { openPage } = await import('./page')
    const page = await openPage('/custom-library')
    await page.getByTestId('visual-editor').waitFor()
    const tabs = page.getByTestId('library').getByRole('tab')
    expect(await tabs.allTextContents()).toEqual(['custom', 'other'])
    expect(await page.getByTestId('library').locator('img').count()).toBe(0)
    await page.getByRole('button', { name: 'Add Plain block' }).click()
    await expect
      .poll(() => page.getByTestId('canvas').locator('p').textContent())
      .toBe('Custom block')

    await page.locator('#only-other').click()
    expect(await tabs.allTextContents()).toEqual(['other'])
    expect(await tabs.first().getAttribute('aria-selected')).toBe('true')
    expect(await page.getByRole('button', { name: 'Add Other block' }).isVisible()).toBe(true)

    await page.locator('#no-categories').click()
    expect(await tabs.count()).toBe(0)
    expect(await page.getByTestId('library').getByRole('listitem').count()).toBe(0)
  })
})
