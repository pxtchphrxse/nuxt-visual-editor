import type { Page } from 'playwright-core'
import { describe, expect, it } from 'vitest'
import {
  DOC,
  bgColor,
  canvas,
  expectModel,
  openEditor,
  openPanel,
  selectVar,
  style,
} from './editor'

async function heading(page: Page) {
  const h2 = canvas(page).locator('h2')
  await h2.click()
  return h2
}

describe('typography', () => {
  it('applies responsive font sizes at each breakpoint', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'typography')
    await selectVar(page, '--fs', '1rem')
    await selectVar(page, '--fs-sm', '1.5rem')
    await selectVar(page, '--fs-md', '1.875rem')
    await selectVar(page, '--fs-lg', '2.25rem')
    for (const [width, px] of [
      [500, '16px'],
      [700, '24px'],
      [900, '30px'],
      [1100, '36px'],
    ] as const) {
      await page.setViewportSize({ width, height: 900 })
      expect(await style(h2, 'font-size'), `${width}px viewport`).toBe(px)
    }
    await expectModel(page, (html) =>
      html.includes(
        'class="fs" style="--fs: 1rem; --fs-sm: 1.5rem; --fs-md: 1.875rem; --fs-lg: 2.25rem;"',
      ),
    )
  })

  it('sets weight, family, style, alignment and line height', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'typography')
    await selectVar(page, '--fw', '300')
    await selectVar(page, '--ff', 'var(--ve-font-serif)')
    await selectVar(page, '--fst', 'italic')
    await selectVar(page, '--ta', 'center')
    await selectVar(page, '--fs', '1rem')
    await selectVar(page, '--lh', '2')
    expect(await style(h2, 'font-weight')).toBe('300')
    expect(await style(h2, 'font-family')).toContain('Georgia')
    expect(await style(h2, 'font-style')).toBe('italic')
    expect(await style(h2, 'text-align')).toBe('center')
    expect(await style(h2, 'line-height')).toBe('32px')
  })

  it('resets a property back to default', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'typography')
    await selectVar(page, '--fw', '300')
    await selectVar(page, '--fw', '')
    expect(await h2.getAttribute('class')).toBeNull()
    expect(await h2.getAttribute('style')).toBeNull()
  })

  it('shows values that are not in the option list', async () => {
    const page = await openEditor(
      '<section data-ve-id="s" data-ve-v="2"><h2 class="fs" style="--fs: 13px;">Odd size</h2></section>',
    )
    await canvas(page).locator('h2').click()
    await openPanel(page, 'typography')
    expect(await page.locator('select[data-var="--fs"]').inputValue()).toBe('13px')
  })
})

describe('colour and opacity', () => {
  it('sets background and text colours from the palette', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'color')
    const bg = page.locator('fieldset[data-var="--bg"]')
    await bg.getByRole('button', { name: '#10b981' }).click()
    expect(await style(h2, 'background-color')).toBe(await bgColor(page, '#10b981'))
    expect(await bg.getByRole('button', { name: '#10b981' }).getAttribute('aria-pressed')).toBe(
      'true',
    )

    await page.locator('fieldset[data-var="--fg"]').getByRole('button', { name: '#ffffff' }).click()
    expect(await style(h2, 'color')).toBe('rgb(255, 255, 255)')

    await bg.getByRole('button', { name: 'No colour' }).click()
    expect(await style(h2, 'background-color')).toBe('rgba(0, 0, 0, 0)')
  })

  it('accepts a custom hex and rejects invalid input', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'color')
    const hex = page.locator('fieldset[data-var="--bg"]').getByLabel('Hex')
    await hex.fill('red')
    await hex.press('Enter')
    expect(
      (await page.locator('fieldset[data-var="--bg"] [role="alert"]').textContent())?.trim(),
    ).toBe('Use a hex colour such as #10b981.')
    expect(await hex.getAttribute('aria-invalid')).toBe('true')
    await hex.fill('#123abc')
    await hex.blur()
    expect(await style(h2, 'background-color')).toBe(await bgColor(page, '#123abc'))
    expect(await page.locator('fieldset[data-var="--bg"] [role="alert"]').count()).toBe(0)
    await hex.fill('')
    await hex.press('Enter')
    expect(await h2.getAttribute('style')).toBeNull()
  })

  it('applies background opacity and element opacity', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'color')
    await page.locator('fieldset[data-var="--bg"]').getByRole('button', { name: '#10b981' }).click()
    await selectVar(page, '--bg-a', '0.5')
    expect(await style(h2, 'background-color')).toBe(await bgColor(page, '#10b981', 0.5))
    await selectVar(page, '--op', '0.25')
    expect(await style(h2, 'opacity')).toBe('0.25')
  })
})

describe('spacing and borders', () => {
  it('applies padding and margin on both axes', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'spacing')
    await selectVar(page, '--pad-y', '2rem')
    await selectVar(page, '--pad-x', '1rem')
    await selectVar(page, '--mar-y', '0.5rem')
    await selectVar(page, '--mar-x', 'auto')
    expect(await style(h2, 'padding-top')).toBe('32px')
    expect(await style(h2, 'padding-left')).toBe('16px')
    expect(await style(h2, 'margin-top')).toBe('8px')
    expect(await h2.getAttribute('class')).toBe('pad mar')
  })

  it('does not leak a parent value into a child that sets only one axis', async () => {
    const page = await openEditor(
      '<section data-ve-id="s" data-ve-v="2" class="pad" style="--pad-y: 4rem;"><h2 class="pad" style="--pad-x: 1rem;">Child</h2></section>',
    )
    const h2 = canvas(page).locator('h2')
    expect(await style(h2, 'padding-top')).toBe('0px')
    expect(await style(h2, 'padding-left')).toBe('16px')
  })

  it('sets border style, width, colour and radius', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'border')
    await selectVar(page, '--bd-s', 'dashed')
    await selectVar(page, '--bd-w', '4px')
    await page
      .locator('fieldset[data-var="--bd-c"]')
      .getByRole('button', { name: '#ef4444' })
      .click()
    await selectVar(page, '--r', '0.5rem')
    await selectVar(page, '--r-tl', '1rem')
    expect(await style(h2, 'border-top-style')).toBe('dashed')
    expect(await style(h2, 'border-top-width')).toBe('4px')
    expect(await style(h2, 'border-top-color')).toBe('rgb(239, 68, 68)')
    expect(await style(h2, 'border-top-left-radius')).toBe('16px')
    expect(await style(h2, 'border-bottom-right-radius')).toBe('8px')
    await expectModel(page, (html) => html.includes('class="bd rad"'))
  })
})

describe('custom classes', () => {
  it('adds and removes classes, rejecting invalid, reserved and duplicate names', async () => {
    const page = await openEditor(DOC)
    const h2 = await heading(page)
    await openPanel(page, 'classes')
    const input = page.getByLabel('Add class')
    const error = page.locator('[data-panel="classes"] [role="alert"]')

    await input.fill('hero-title')
    await input.press('Enter')
    expect(await h2.getAttribute('class')).toBe('hero-title')
    expect(await input.inputValue()).toBe('')

    await input.fill('bad"name')
    await input.press('Enter')
    expect((await error.textContent())?.trim()).toContain('cannot contain spaces, quotes')
    await input.fill('pad')
    await input.press('Enter')
    expect((await error.textContent())?.trim()).toBe(
      'That class is managed by the editor controls.',
    )
    await input.fill('hero-title')
    await input.press('Enter')
    expect((await error.textContent())?.trim()).toBe('The element already has that class.')
    await input.fill('   ')
    await input.press('Enter')

    await page.getByRole('button', { name: 'Remove class hero-title' }).click()
    expect(await h2.getAttribute('class')).toBeNull()
    await expectModel(page, (html) => html.includes('<h2>Heading</h2>'))
  })
})
