// SCSS -> PostCSS pipeline for the saved-content stylesheet.
import { fileURLToPath } from 'node:url'
import cssnano from 'cssnano'
import postcss, { type Root } from 'postcss'
import presetEnv from 'postcss-preset-env'
import * as sass from 'sass'

export const CONTAINER_SENTINEL = '.__ve_container__'
export const BROWSERS = 'baseline widely available'

const ENTRY = fileURLToPath(new URL('../src/styles/content/content.scss', import.meta.url))

/** Throws unless every rule is scoped under the container sentinel. */
export function assertScoped(root: Root): void {
  root.walkRules((rule) => {
    for (const selector of rule.selectors) {
      if (!selector.startsWith(CONTAINER_SENTINEL)) {
        throw new Error(`Unscoped selector in content CSS: "${selector}"`)
      }
    }
  })
}

export async function compileContentCss(): Promise<string> {
  const { css } = sass.compile(ENTRY, { style: 'expanded' })
  const result = await postcss([
    presetEnv({ browsers: BROWSERS, stage: 2 }),
    cssnano({ preset: 'default' }),
  ]).process(css, { from: ENTRY })
  assertScoped(result.root)
  return result.css
}
