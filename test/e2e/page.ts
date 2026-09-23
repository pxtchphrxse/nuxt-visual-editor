// Per-test browser pages with coverage collection and a zero-console-error policy.
import { chromium, type Browser, type Page } from 'playwright-core'
import { afterAll, afterEach, inject } from 'vitest'
import { addBrowserCoverage } from './coverage'

let browser: Browser | undefined
const open: Array<{ page: Page; errors: string[] }> = []

export interface OpenOptions {
  fixture?: string
  width?: number
  height?: number
  /** Console messages matching these are allowed (for tests that provoke them). */
  allowErrors?: RegExp[]
}

export function fixtureUrl(path: string, fixture = 'editor'): string {
  const base = inject('fixtures')[fixture]
  if (!base) throw new Error(`Fixture "${fixture}" is not running`)
  return new URL(path.replace(/^\//, ''), base).href
}

export const hasFixture = (name: string) => Boolean(inject('fixtures')[name])

export async function openPage(path: string, options: OpenOptions = {}): Promise<Page> {
  browser ??= await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: options.width ?? 1400, height: options.height ?? 900 },
  })
  const page = await context.newPage()
  const errors: string[] = []
  const allowed = (text: string) => options.allowErrors?.some((re) => re.test(text))
  page.on('console', (msg) => {
    if ((msg.type() === 'error' || msg.type() === 'warning') && !allowed(msg.text()))
      errors.push(`${msg.type()}: ${msg.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('dialog', (dialog) => {
    errors.push(`native dialog: ${dialog.message()}`)
    void dialog.dismiss()
  })
  await page.coverage.startJSCoverage({ resetOnNavigation: false })
  open.push({ page, errors })
  await page.goto(fixtureUrl(path, options.fixture))
  return page
}

afterEach(async () => {
  const pages = open.splice(0)
  for (const { page, errors } of pages) {
    const coverage = await page.coverage.stopJSCoverage()
    await addBrowserCoverage(coverage)
    await page.context().close()
    if (errors.length) {
      throw new Error(
        `Unexpected console errors, page errors or native dialogs:\n${errors.join('\n')}`,
      )
    }
  }
})

afterAll(async () => {
  await browser?.close()
  browser = undefined
})
