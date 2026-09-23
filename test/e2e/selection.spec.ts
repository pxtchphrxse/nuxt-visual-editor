import { describe, expect, it } from 'vitest'
import { DOC, canvas, inspector, openEditor } from './editor'

describe('selection', () => {
  it('outlines the hovered element only', async () => {
    const page = await openEditor(DOC)
    const p = canvas(page).locator('p').first()
    await p.hover()
    expect(await canvas(page).locator('[data-ve-hovered]').count()).toBe(1)
    expect(await p.getAttribute('data-ve-hovered')).toBe('')
    await canvas(page).locator('h2').hover()
    expect(await p.getAttribute('data-ve-hovered')).toBeNull()
    await page.mouse.move(5, 5)
    expect(await canvas(page).locator('[data-ve-hovered]').count()).toBe(0)
  })

  it('selects the clicked element and shows its tag', async () => {
    const page = await openEditor(DOC)
    expect(await inspector(page).innerText()).toContain(
      'Select an element in the canvas to edit it.',
    )
    await canvas(page).locator('h2').click()
    expect((await inspector(page).locator('.ve-inspector__title').textContent())?.trim()).toBe(
      'Editing <h2>',
    )
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(1)
    await canvas(page).locator('p').first().click()
    expect(await canvas(page).locator('h2').getAttribute('data-ve-selected')).toBeNull()
    expect((await inspector(page).locator('.ve-inspector__title').textContent())?.trim()).toBe(
      'Editing <p>',
    )
  })

  it('walks up to the parent and deselects with the button or Escape', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    await page.getByRole('button', { name: 'Select parent element' }).click()
    expect((await inspector(page).locator('.ve-inspector__title').textContent())?.trim()).toBe(
      'Editing <div>',
    )
    await page.getByRole('button', { name: 'Select parent element' }).click()
    expect((await inspector(page).locator('.ve-inspector__title').textContent())?.trim()).toBe(
      'Editing <section>',
    )
    expect(await page.getByRole('button', { name: 'Select parent element' }).count()).toBe(0)

    await page.getByRole('button', { name: 'Deselect' }).click()
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(0)

    await canvas(page).locator('p').first().click()
    await page.keyboard.press('Escape')
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(0)
  })

  it('does not navigate when a link in the content is clicked', async () => {
    const page = await openEditor(
      '<section data-ve-id="s" data-ve-v="2"><p><a href="https://example.com/away">away</a></p></section>',
    )
    const before = page.url()
    await canvas(page).locator('a').click()
    expect(page.url()).toBe(before)
    expect((await inspector(page).locator('.ve-inspector__title').textContent())?.trim()).toBe(
      'Editing <a>',
    )
  })

  it('ignores clicks on the canvas background', async () => {
    const page = await openEditor(DOC)
    await canvas(page)
      .locator('.ve-section__content')
      .evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(0)
  })

  it('toggles the library and inspector', async () => {
    const page = await openEditor(DOC)
    await page.getByRole('button', { name: 'Toggle component library' }).click()
    expect(await page.getByTestId('library').isVisible()).toBe(false)
    await page.getByRole('button', { name: 'Toggle inspector' }).click()
    expect(await inspector(page).isVisible()).toBe(false)
    await page.getByRole('button', { name: 'Toggle component library' }).click()
    await page.getByRole('button', { name: 'Toggle inspector' }).click()
    expect(await page.getByTestId('library').isVisible()).toBe(true)
    expect(await inspector(page).isVisible()).toBe(true)
  })
})
