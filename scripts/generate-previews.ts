// Regenerates the library preview images by rendering each built-in component with the real
// content stylesheet in Chromium. Usage: node scripts/generate-previews.ts
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'
import { compileContentCss } from '../build/content-css.ts'
import type { ComponentDefinition } from '../src/app/context'

// The library is extensionless (Vite-style) TypeScript, so load it through Vite's SSR loader.
const vite = await createServer({
  configFile: false,
  logLevel: 'error',
  server: { middlewareMode: true },
})
const { DEFAULT_COMPONENTS } = (await vite.ssrLoadModule(
  '/src/app/library/default-components.ts',
)) as {
  DEFAULT_COMPONENTS: ComponentDefinition[]
}
await vite.close()

const assetsDir = fileURLToPath(new URL('../src/assets/public', import.meta.url))
const previewsDir = join(assetsDir, 'previews')
const css = (await compileContentCss()).replaceAll('.__ve_container__', '.ve-content')
const tmp = await mkdtemp(join(tmpdir(), 've-previews-'))

const wanted = new Set(DEFAULT_COMPONENTS.map((c) => c.preview!.split('/').pop()!))
for (const file of await readdir(previewsDir)) {
  if (!wanted.has(file)) await rm(join(previewsDir, file))
}

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 0.5,
})
try {
  for (const component of DEFAULT_COMPONENTS) {
    const html = component.html.replaceAll('{{assets}}', pathToFileURL(assetsDir).href)
    const file = join(tmp, 'preview.html')
    await writeFile(
      file,
      `<!doctype html><html><head><meta charset="utf-8"><style>
      body{margin:0;background:#fff;color:#111827;font-family:system-ui,sans-serif}
      h1,h2,h3,p,blockquote{margin:0}
      ${css}</style></head><body><div class="ve-content">${html}</div></body></html>`,
    )
    await page.goto(pathToFileURL(file).href)
    await page.waitForLoadState('networkidle')
    const out = join(previewsDir, component.preview!.split('/').pop()!)
    await page.locator('.ve-content > section').screenshot({ path: out })
    console.log(`  ✓ ${component.name}`)
  }
} finally {
  await browser.close()
  await rm(tmp, { recursive: true, force: true })
}
