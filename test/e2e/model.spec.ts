import { describe, expect, it } from 'vitest'
import {
  DOC,
  addComponent,
  canvas,
  expectModel,
  model,
  openEditor,
  openPanel,
  selectVar,
} from './editor'
import { openPage } from './page'

describe('v-model', () => {
  it('normalises loaded content (ids, version) and emits it', async () => {
    const page = await openEditor('<section><p>no id</p></section>')
    await expectModel(page, (html) => /^<section [^>]*><p>no id<\/p><\/section>$/.test(html))
    const attrs = await page.evaluate(() => {
      const tpl = document.createElement('template')
      tpl.innerHTML = window.__ve.html.value
      const s = tpl.content.firstElementChild!
      return { id: s.getAttribute('data-ve-id'), v: s.getAttribute('data-ve-v') }
    })
    expect(attrs.id).toMatch(/^[\da-f-]{36}$/)
    expect(attrs.v).toBe('2')
  })

  it('reloads when the parent changes the value', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    await page.evaluate(() => {
      window.__ve.html.value =
        '<section data-ve-id="new" data-ve-v="2"><h2>Replaced from outside</h2></section>'
    })
    await expect.poll(() => canvas(page).locator('h2').textContent()).toBe('Replaced from outside')
    expect(await canvas(page).locator('[data-ve-selected]').count()).toBe(0)
  })

  it('debounces edits and flushes when focus leaves the editor', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    await openPanel(page, 'spacing')
    const before = await model(page)
    const select = page.locator('select[data-var="--pad-y"]')
    await select.focus()
    await selectVar(page, '--pad-y', '2rem')
    // 300 ms debounce: not emitted synchronously...
    expect(await model(page)).toBe(before)
    // ...but flushed immediately when focus leaves the editor.
    await select.evaluate((el) => (el as HTMLElement).blur())
    expect(await model(page)).toContain('--pad-y: 2rem;')
  })

  it('emits after the debounce without a blur', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    await openPanel(page, 'spacing')
    await selectVar(page, '--pad-x', '1rem')
    await expectModel(page, (html) => html.includes('--pad-x: 1rem;'))
  })

  it('flushes a pending edit when the editor unmounts', async () => {
    const page = await openEditor(DOC)
    await canvas(page).locator('h2').click()
    await openPanel(page, 'spacing')
    await selectVar(page, '--pad-y', '3rem')
    // Navigating away unmounts the editor; the pending change must still reach the model.
    const flushed = page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          const stop = setInterval(() => {
            if (window.__ve.html.value.includes('--pad-y: 3rem;')) {
              clearInterval(stop)
              resolve(window.__ve.html.value)
            }
          }, 10)
        }),
    )
    await page.evaluate(() => {
      const app = document.querySelector('#__nuxt') as HTMLElement & {
        __vue_app__?: { unmount: () => void }
      }
      app.__vue_app__!.unmount()
    })
    expect(await flushed).toContain('--pad-y: 3rem;')
  })
})

describe('multiple editors', () => {
  it('keeps two editors on one page independent', async () => {
    const page = await openPage('/two-editors')
    await page.waitForFunction(() => Boolean((window as unknown as { __two?: unknown }).__two))
    const a = page.locator('[data-editor="a"]')
    const b = page.locator('[data-editor="b"]')
    await a.getByRole('button', { name: 'Add Support center' }).click()
    await b.getByRole('tab', { name: 'teams' }).click()
    await b.getByRole('button', { name: 'Add Meet our team' }).click()
    await a.getByTestId('canvas').locator('h2').click()
    expect(await a.locator('[data-ve-selected]').count()).toBe(1)
    expect(await b.locator('[data-ve-selected]').count()).toBe(0)
    expect(await b.getByTestId('inspector').innerText()).toContain('Select an element')

    await a.getByTestId('canvas').locator('h2').hover()
    expect(await b.locator('[data-ve-hovered]').count()).toBe(0)

    const two = () =>
      page.evaluate(() => {
        const w = window as unknown as { __two: { a: { value: string }; b: { value: string } } }
        return { a: w.__two.a.value, b: w.__two.b.value }
      })
    await expect.poll(async () => (await two()).a).toContain('Support center')
    await expect.poll(async () => (await two()).b).toContain('Meet our team')
    expect((await two()).a).not.toContain('Meet our team')
  })
})

describe('preview', () => {
  it('shows the sanitized current document and closes', async () => {
    const page = await openEditor(DOC)
    await addComponent(page, 'headers', 'Support center')
    await page.getByRole('button', { name: 'Preview' }).click()
    const dialog = page.getByRole('dialog', { name: 'Preview' })
    await dialog.waitFor()
    const preview = page.getByTestId('preview')
    expect(await preview.getAttribute('class')).toContain('site-cms')
    expect(await preview.locator('section').count()).toBe(2)
    expect(await preview.locator('[data-ve-selected], [data-ve-hovered]').count()).toBe(0)
    await dialog.getByRole('button', { name: 'Close' }).click()
    await dialog.waitFor({ state: 'detached' })
  })
})
