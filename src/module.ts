import { defineNuxtModule, addPlugin, createResolver, addComponent, installModule } from '@nuxt/kit'
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
    nuxt.options.build.transpile.push('@heroicons/vue')

    await installTailwind(options, nuxt, resolve)
    await installModule('nuxt-headlessui')

    // add preview images for default components
    nuxt.hook('nitro:config', async (nitroConfig) => {
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolve('./runtime/public'),
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    })

    addComponent({ filePath: resolve('./runtime/components/VisualEditor.vue'), name: 'VisualEditor' })
  },
})
