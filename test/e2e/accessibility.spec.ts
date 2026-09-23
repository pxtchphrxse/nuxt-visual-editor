import { AxeBuilder } from '@axe-core/playwright'
import { describe, expect, it } from 'vitest'
import { DOC, canvas, openEditor, openPanel } from './editor'

async function seriousViolations(page: import('playwright-core').Page, include: string) {
  const results = await new AxeBuilder({ page: page as never }).include(include).analyze()
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

describe('accessibility', () => {
  it('has no serious or critical axe violations in the editor chrome', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    for (const panel of ['text', 'link', 'typography', 'color', 'spacing', 'border', 'classes'])
      await openPanel(page, panel)
    expect(await seriousViolations(page, '[data-testid="visual-editor"]')).toEqual([])
  })

  it('has no serious or critical violations in dialogs', async () => {
    const page = await openEditor(DOC)
    await page.getByRole('button', { name: 'Delete section 1' }).click()
    await page.getByRole('dialog').waitFor()
    expect(await seriousViolations(page, '[role="dialog"]')).toEqual([])
  })

  it('is operable from the keyboard', async () => {
    const page = await openEditor(DOC)
    await page.getByRole('button', { name: 'Add Support center' }).focus()
    await page.keyboard.press('Enter')
    expect(await canvas(page).locator('.ve-section').count()).toBe(2)
    await page.getByRole('tab', { name: 'teams' }).focus()
    await page.keyboard.press('Space')
    expect(await page.getByRole('tab', { name: 'teams' }).getAttribute('aria-selected')).toBe(
      'true',
    )
  })
})
