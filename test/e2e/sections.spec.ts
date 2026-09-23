import { describe, expect, it } from 'vitest'
import { addComponent, canvas, expectModel, model, openEditor } from './editor'

const headings = (page: import('playwright-core').Page) =>
  canvas(page).locator('.ve-section h2').allTextContents()

async function threeSections() {
  const page = await openEditor()
  await addComponent(page, 'headers', 'Support center')
  await addComponent(page, 'features', 'Splitted image grid')
  await addComponent(page, 'teams', 'Meet our team')
  await expectModel(page, (html) => (html.match(/<section /g) ?? []).length === 3)
  return page
}

describe('sections', () => {
  it('moves sections up and down, with the ends disabled', async () => {
    const page = await threeSections()
    expect(await headings(page)).toEqual(['Support center', 'Built for teams', 'Meet our team'])
    await expect
      .poll(() => page.getByRole('button', { name: 'Move section 1 up' }).isDisabled())
      .toBe(true)
    await expect
      .poll(() => page.getByRole('button', { name: 'Move section 3 down' }).isDisabled())
      .toBe(true)

    await page.getByRole('button', { name: 'Move section 1 down' }).click()
    expect(await headings(page)).toEqual(['Built for teams', 'Support center', 'Meet our team'])
    await page.getByRole('button', { name: 'Move section 3 up' }).click()
    expect(await headings(page)).toEqual(['Built for teams', 'Meet our team', 'Support center'])
    await expectModel(
      page,
      (html) =>
        html.indexOf('Built for teams') < html.indexOf('Meet our team') &&
        html.indexOf('Meet our team') < html.indexOf('Support center'),
    )
  })

  it('asks before deleting, and cancel keeps the section', async () => {
    const page = await threeSections()
    await page.getByRole('button', { name: 'Delete section 2' }).click()
    const dialog = page.getByRole('dialog', { name: 'Delete section?' })
    await dialog.waitFor()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await dialog.waitFor({ state: 'detached' })
    expect(await canvas(page).locator('.ve-section').count()).toBe(3)
  })

  it('deletes a section and restores it in place with undo', async () => {
    const page = await threeSections()
    await page.getByRole('button', { name: 'Delete section 2' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
    expect(await headings(page)).toEqual(['Support center', 'Meet our team'])
    await expectModel(page, (html) => !html.includes('Built for teams'))

    await page.getByRole('button', { name: 'Undo' }).click()
    expect(await headings(page)).toEqual(['Support center', 'Built for teams', 'Meet our team'])
    await expectModel(page, (html) => html.includes('Built for teams'))
    expect(await page.getByRole('button', { name: 'Undo' }).count()).toBe(0)
  })

  it("clears the selection when the selected element's section is deleted", async () => {
    const page = await threeSections()
    await canvas(page).locator('.ve-section').nth(1).locator('h2').click()
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(1)
    await page.getByRole('button', { name: 'Delete section 2' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
    expect(await page.getByTestId('inspector').innerText()).toContain('Select an element')
  })

  it('keeps the selection when another section is deleted', async () => {
    const page = await threeSections()
    await canvas(page).locator('.ve-section').first().locator('h2').click()
    await page.getByRole('button', { name: 'Delete section 3' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(1)
  })

  it('closes the delete dialog with Escape', async () => {
    const page = await threeSections()
    await page.getByRole('button', { name: 'Delete section 1' }).click()
    await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    expect(await canvas(page).locator('.ve-section').count()).toBe(3)
  })

  it('shows the toolbar to keyboard users', async () => {
    const page = await threeSections()
    await page.getByRole('button', { name: 'Move section 2 up' }).focus()
    const toolbar = page.getByRole('toolbar', { name: 'Section 2 actions' })
    await expect.poll(() => toolbar.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })

  it('shows an empty state and emits an empty model when everything is deleted', async () => {
    const page = await openEditor()
    await addComponent(page, 'headers', 'Support center')
    await expectModel(page, (html) => html.includes('Support center'))
    await page.getByRole('button', { name: 'Delete section 1' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
    await expectModel(page, (html) => html === '')
    expect(
      await canvas(page).getByText('Add a component from the library to start.').isVisible(),
    ).toBe(true)
    expect(await model(page)).toBe('')
  })
})
