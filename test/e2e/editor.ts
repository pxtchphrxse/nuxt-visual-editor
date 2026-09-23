import type { Locator, Page } from 'playwright-core'
import { expect } from 'vitest'
import { openPage, type OpenOptions } from './page'

declare global {
  interface Window {
    __ve: {
      html: { value: string }
      sanitized: { value: unknown[][] }
      migrated: { value: unknown[] }
    }
    __pwned?: boolean
  }
}

export async function openEditor(html = '', options: OpenOptions = {}): Promise<Page> {
  const page = await openPage(`/editor${html ? `?html=${encodeURIComponent(html)}` : ''}`, options)
  await page.getByTestId('visual-editor').waitFor()
  // Wait for hydration: the library buttons are interactive once the editor has mounted.
  await page.waitForFunction(() => Boolean(window.__ve))
  return page
}

export const canvas = (page: Page) => page.getByTestId('canvas')
export const inspector = (page: Page) => page.getByTestId('inspector')

export async function addComponent(page: Page, category: string, name: string) {
  await page.getByTestId('library').getByRole('tab', { name: category }).click()
  await page.getByRole('button', { name: `Add ${name}` }).click()
}

export async function openPanel(page: Page, panel: string) {
  const trigger = page.locator(`[data-panel="${panel}"] > button`).first()
  if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click()
}

export async function selectVar(page: Page, name: string, value: string) {
  await page.locator(`select[data-var="${name}"]`).selectOption(value)
}

export const model = (page: Page) => page.evaluate(() => window.__ve.html.value)
export const sanitizedEvents = (page: Page) => page.evaluate(() => window.__ve.sanitized.value)

/** Waits until the (debounced) model satisfies `predicate`. */
export async function expectModel(
  page: Page,
  predicate: (html: string) => boolean,
  message?: string,
) {
  await expect.poll(() => model(page), { timeout: 5_000, message }).toSatisfy(predicate)
}

/** The computed background of a vocabulary `bg` (resolved through the same color-mix()). */
export const bgColor = (page: Page, hex: string, alpha = 1) =>
  page.evaluate(
    ([color, a]) => {
      const probe = document.createElement('div')
      probe.style.backgroundColor = `color-mix(in srgb, ${color} calc(${a} * 100%), transparent)`
      document.body.append(probe)
      const out = getComputedStyle(probe).backgroundColor
      probe.remove()
      return out
    },
    [hex, alpha] as const,
  )

export const style = (locator: Locator, property: string) =>
  locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property)

/** A single-section document for tests that need known content. */
export const DOC =
  '<section data-ve-id="s1" data-ve-v="2"><div class="stack" style="--gap: 1rem;">' +
  '<h2>Heading</h2><p>First paragraph</p><p>Second paragraph</p>' +
  '<img class="img" src="/_visual-editor/placeholder_image.jpg" alt="Placeholder"></div></section>'
