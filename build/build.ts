// Package build (replaces @nuxt/module-builder):
//   dist/module.mjs + module.d.mts + types.d.mts + module.json   Nuxt module (node)
//   dist/runtime/**.js (+ .d.ts)                                  runtime utilities, plugins, core
//   dist/app/{editor,content}.js + editor.css (+ .d.ts)           precompiled Vue components
//   dist/runtime/content.css                                      content stylesheet (sentinel)
//   dist/runtime/public/**                                        preview images / placeholder
// dist/ mirrors src/ so relative type imports in the emitted declarations stay valid.
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'
import { compileContentCss } from './content-css.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const r = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const pkg = JSON.parse(await readFile(r('package.json'), 'utf8')) as {
  name: string
  version: string
}

// Resolved by the consumer's Nuxt build: Nuxt virtual modules, our runtime alias and peer libs.
const APP_EXTERNAL = [/^#/, 'vue', 'reka-ui', 'dompurify']

/** Typed `visualEditor` config key and public runtime config for consumers. */
const augment = (target: string) => `declare module '${target}' {
interface NuxtConfig { visualEditor?: Partial<ModuleOptions> }
interface NuxtOptions { visualEditor?: Partial<ModuleOptions> }
interface PublicRuntimeConfig { visualEditor: PublicVisualEditorConfig }
}`

async function step(name: string, fn: () => Promise<unknown>) {
  const start = performance.now()
  await fn()
  console.log(`  ✓ ${name} (${Math.round(performance.now() - start)} ms)`)
}

console.log(`Building ${pkg.name}@${pkg.version}`)
await rm(r('dist'), { recursive: true, force: true })

await step('module', () =>
  build({
    configFile: false,
    root,
    logLevel: 'warn',
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      ssr: 'src/module.ts',
      target: 'node22',
      minify: false,
      sourcemap: true,
      rollupOptions: { output: { entryFileNames: 'module.mjs', format: 'es' } },
    },
  }),
)

await step('runtime', () =>
  build({
    configFile: false,
    root,
    logLevel: 'warn',
    build: {
      outDir: 'dist/runtime',
      emptyOutDir: false,
      target: 'es2022',
      minify: false,
      sourcemap: true,
      lib: {
        formats: ['es'],
        entry: {
          sanitize: r('src/runtime/sanitize.ts'),
          'plugins/sanitizer.server': r('src/runtime/plugins/sanitizer.server.ts'),
          'server/plugins/sanitizer': r('src/runtime/server/plugins/sanitizer.ts'),
          'server/init-sanitizer': r('src/runtime/server/init-sanitizer.ts'),
          'core/document': r('src/runtime/core/document.ts'),
          'core/migrate-v1': r('src/runtime/core/migrate-v1.ts'),
          'core/schema': r('src/runtime/core/schema.ts'),
        },
      },
      rollupOptions: {
        external: [...APP_EXTERNAL, 'jsdom'],
        output: {
          preserveModules: true,
          preserveModulesRoot: r('src/runtime'),
          entryFileNames: '[name].js',
        },
      },
    },
  }),
)

await step('app components', () =>
  build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [vue()],
    // Components `@use 'editor/mixins'` from src/styles.
    css: { preprocessorOptions: { scss: { loadPaths: [r('src/styles')] } } },
    build: {
      outDir: 'dist/app',
      emptyOutDir: false,
      target: 'es2022',
      minify: false,
      sourcemap: true,
      cssCodeSplit: false,
      lib: {
        formats: ['es'],
        entry: { editor: r('src/app/editor.ts'), content: r('src/app/content.ts') },
        cssFileName: 'editor',
      },
      rollupOptions: {
        external: APP_EXTERNAL,
        output: { entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js' },
      },
    },
  }),
)

await step('content.css', async () => {
  await writeFile(r('dist/runtime/content.css'), await compileContentCss())
})

await step('assets', () =>
  cp(r('src/assets/public'), r('dist/runtime/public'), { recursive: true }),
)

await step('types', async () => {
  execFileSync('vue-tsc', ['-p', r('build/tsconfig.types.json')], { stdio: 'inherit', cwd: root })
  const out = r('dist/.types')
  await cp(`${out}/runtime`, r('dist/runtime'), { recursive: true })
  await cp(`${out}/app`, r('dist/app'), { recursive: true })
  await writeFile(r('dist/module.d.mts'), await readFile(`${out}/module.d.ts`, 'utf8'))
  await cp(`${out}/options.d.ts`, r('dist/options.d.ts'))
  await rm(out, { recursive: true, force: true })

  await writeFile(
    r('dist/types.d.mts'),
    `import type { ModuleOptions, PublicVisualEditorConfig } from './module.mjs'

${augment('@nuxt/schema')}

${augment('nuxt/schema')}

export { default } from './module.mjs'
export type { ContentTokens, EditorTheme, ModuleOptions, PublicVisualEditorConfig } from './module.mjs'
`,
  )
})

await step('module.json', async () => {
  await mkdir(r('dist'), { recursive: true })
  await writeFile(
    r('dist/module.json'),
    `${JSON.stringify(
      {
        name: pkg.name,
        configKey: 'visualEditor',
        compatibility: { nuxt: '>=3.21.0' },
        version: pkg.version,
      },
      null,
      2,
    )}\n`,
  )
})

console.log('Done.')
