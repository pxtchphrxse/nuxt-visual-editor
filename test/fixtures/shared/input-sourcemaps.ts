// Test-only Vite plugin: loads the package's dist/*.js together with its source map so the
// consumer build composes both maps and e2e coverage resolves to src/ instead of dist/.
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

const isOurDist = new Map<string, Promise<boolean>>()

/** True for files inside this package's dist/, whether linked or copied into node_modules. */
function inPackageDist(file: string): Promise<boolean> {
  const at = file.lastIndexOf('/dist/')
  if (at === -1 || !file.endsWith('.js')) return Promise.resolve(false)
  const dist = file.slice(0, at + '/dist/'.length)
  if (!isOurDist.has(dist)) {
    isOurDist.set(
      dist,
      readFile(`${dist}module.json`, 'utf8')
        .then((json) => (JSON.parse(json) as { name?: string }).name === 'nuxt-visual-editor')
        .catch(() => false),
    )
  }
  return isOurDist.get(dist)!
}

export function inputSourcemaps(): Plugin {
  return {
    name: 've-input-sourcemaps',
    enforce: 'pre',
    async load(id) {
      const file = id.split('?')[0]!
      if (!(await inPackageDist(file))) return null
      const code = await readFile(file, 'utf8')
      const ref = code.match(/\/\/# sourceMappingURL=(\S+\.map)\s*$/)?.[1]
      if (!ref) return null
      const map = JSON.parse(await readFile(resolve(dirname(file), ref), 'utf8'))
      return { code: code.replace(/\/\/# sourceMappingURL=\S+\s*$/, ''), map }
    },
  }
}
