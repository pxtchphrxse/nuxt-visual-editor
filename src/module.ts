import { defineNuxtModule, addPlugin, createResolver, addComponentsDir } from '@nuxt/kit'
import installTailwind from './tailwind'

export interface ImageProviders {
  base64: boolean
}

export interface ModuleOptions {
  image_providers?: ImageProviders
  theme?: {
    myPrimaryBrandColor?: string
    myPrimaryLinkColor?: string
    myPrimaryLightGrayColor?: string
    myPrimaryMediumGrayColor?: string
    myPrimaryDarkGrayColor?: string
    myPrimaryErrorColor?: string
    myPrimarySuccesColor?: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'dnd-visual-editor',
    configKey: 'visualEditor',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    image_providers: { base64: true },
    theme: {
      myPrimaryBrandColor: '#000000',
      myPrimaryLinkColor: '#2563eb',
      myPrimaryLightGrayColor: '#e2e8f0',
      myPrimaryMediumGrayColor: '#9ca3af',
      myPrimaryDarkGrayColor: '#111827',
      myPrimaryErrorColor: '#d60000',
      myPrimarySuccesColor: '#16a34a',
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve('./runtime/plugin'))

    const runtimeDir = resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.build.transpile.push('@headlessui/vue', '@heroicons/vue')

    await installTailwind(options, nuxt, resolve)

    addComponentsDir({ path: resolve('./runtime/components'), global: true })
  },
})
