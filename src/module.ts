import { existsSync, readFileSync } from 'node:fs'
import {
  addComponent,
  addImports,
  addPlugin,
  addServerImports,
  addServerPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'
import {
  BUILT_IN_FONTS,
  renderContentCss,
  renderThemeCss,
  resolveOptions,
  type ModuleOptions,
  type NitroOptionsSubset,
  type PublicVisualEditorConfig,
} from './options'

export type { ContentTokens, EditorTheme, ModuleOptions, PublicVisualEditorConfig } from './options'

export default defineNuxtModule<Partial<ModuleOptions>>({
  meta: {
    name: 'nuxt-visual-editor',
    configKey: 'visualEditor',
    compatibility: { nuxt: '>=3.21.0' },
  },
  defaults: {},
  setup(rawOptions, nuxt) {
    const logger = useLogger('nuxt-visual-editor')
    const options = resolveOptions(rawOptions)
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')

    const contentCssPath = resolve('./runtime/content.css')
    if (!existsSync(contentCssPath)) {
      throw new Error(
        '[nuxt-visual-editor] runtime/content.css is missing; the package build is incomplete.',
      )
    }

    nuxt.options.alias['#visual-editor'] = runtimeDir
    nuxt.options.build.transpile.push(runtimeDir, resolve('./app'))

    const publicConfig: PublicVisualEditorConfig = {
      containerClass: options.containerClass,
      assetsBaseURL: options.assetsBaseURL,
      migrateV1: options.migrateV1,
      sanitizeDebounceMs: options.sanitizeDebounceMs,
      tokens: {
        ...options.tokens,
        fonts: [...new Set([...BUILT_IN_FONTS, ...Object.keys(options.tokens.fonts)])],
      },
    }
    nuxt.options.runtimeConfig.public.visualEditor = publicConfig

    // Content styles (both modes).
    const baseCss = readFileSync(contentCssPath, 'utf8')
    const contentCss = addTemplate({
      filename: 'nuxt-visual-editor/content.css',
      write: true,
      getContents: () => renderContentCss(baseCss, options.containerClass, options.tokens.fonts),
    })
    nuxt.options.css.push(contentCss.dst)

    addComponent({
      name: 'VisualEditorContent',
      export: 'VisualEditorContent',
      filePath: resolve('./app/content.js'),
    })

    // Sanitizer: auto-imported in the app and in Nitro; jsdom only ever loads on the server.
    const sanitizeImports = ['sanitizeVisualContent', 'sanitizeVisualContentDetailed'].map(
      (name) => ({
        name,
        from: resolve('./runtime/sanitize'),
      }),
    )
    addImports(sanitizeImports)
    addServerImports(sanitizeImports)
    addPlugin({ src: resolve('./runtime/plugins/sanitizer.server'), mode: 'server' })
    addServerPlugin(resolve('./runtime/server/plugins/sanitizer'))

    // jsdom must stay a runtime dependency on the server: bundling it breaks its data files and
    // exhausts memory on Nuxt 3's Nitro build. `vite.ssr` only affects the server bundle.
    const viteSsr = (nuxt.options.vite.ssr ??= {})
    if (viteSsr.external !== true) viteSsr.external = [...(viteSsr.external ?? []), 'jsdom']
    const nitro = ((nuxt.options as unknown as { nitro?: NitroOptionsSubset }).nitro ??= {})
    const nitroExternals = (nitro.externals ??= {})
    nitroExternals.external = [...(nitroExternals.external ?? []), 'jsdom']

    if (options.mode === 'styles') {
      logger.info(`Content styles registered (container: .${options.containerClass})`)
      return
    }

    // Editor mode.
    nuxt.options.css.push(resolve('./app/editor.css'))
    const themeCss = addTemplate({
      filename: 'nuxt-visual-editor/theme.css',
      write: true,
      getContents: () => renderThemeCss(options.theme),
    })
    nuxt.options.css.push(themeCss.dst)

    addComponent({
      name: 'VisualEditor',
      export: 'VisualEditor',
      filePath: resolve('./app/editor.js'),
    })

    ;(nitro.publicAssets ??= []).push({
      dir: resolve('./runtime/public'),
      baseURL: options.assetsBaseURL,
      maxAge: 60 * 60 * 24 * 7,
    })
  },
})
