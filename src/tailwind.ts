import { addTemplate, createResolver, installModule, useNuxt } from '@nuxt/kit'
import defu from 'defu'
import { join } from 'pathe'
import type { ModuleOptions } from './module'

export default async function installTailwind(moduleOptions: ModuleOptions, nuxt = useNuxt(), resolve = createResolver(import.meta.url).resolve) {
  const runtimeDir = resolve('./runtime')

  // 1. add tailwindcss config
  const configTemplate = addTemplate({
    filename: 'nuxt-visual-editor-tailwind.config.cjs',
    write: true,
    getContents: () => `
      const defaultTheme = require('tailwindcss/defaultTheme');

      module.exports = {
        content: [
            ${JSON.stringify(resolve(runtimeDir, './**/*.{vue,js,ts,jsx,tsx,json}'))},
        ],
        theme: {
          extend: {
            colors: {
              myPrimaryBrandColor: '${moduleOptions.theme?.myPrimaryBrandColor}',
              myPrimaryLinkColor: '${moduleOptions.theme?.myPrimaryLinkColor}',

              myPrimaryLightGrayColor: '${moduleOptions.theme?.myPrimaryLightGrayColor}',
              myPrimaryMediumGrayColor: '${moduleOptions.theme?.myPrimaryMediumGrayColor}',
              myPrimaryDarkGrayColor: '${moduleOptions.theme?.myPrimaryDarkGrayColor}',

              myPrimaryErrorColor: '${moduleOptions.theme?.myPrimaryErrorColor}',
              myPrimarySuccesColor: '${moduleOptions.theme?.myPrimarySuccesColor}',
            },
            fontFamily: {
              sans: [
                'Jost',
                'Raleway',
                'sans-serif',
                'Georgia',
                'ui-serif',
                'Cambria',
                'Times New Roman',
                'Times',
                'serif',
                ...defaultTheme.fontFamily.sans,
              ],
            },
          },
        },
        plugins: [require('@tailwindcss/forms')],
      };
    `,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { configPath: userTwConfigPath = [], ...twModuleConfig } = (nuxt.options as any).tailwindcss ?? {}

  const twConfigPaths = [
    configTemplate.dst,
    join(nuxt.options.rootDir, 'tailwind.config'),
  ]

  if (typeof userTwConfigPath === 'string') {
    twConfigPaths.push(userTwConfigPath)
  }
  else {
    twConfigPaths.push(...userTwConfigPath)
  }

  // 2. add css file
  const cssTemplate = addTemplate({
    filename: 'nuxt-visual-editor-tailwind.css',
    src: resolve('main.css'),
    write: true,
  })
  nuxt.options.css.push(cssTemplate.dst)

  // 3. install module
  await installModule('@nuxtjs/tailwindcss', defu({
    exposeConfig: true,
    config: {
      darkMode: 'class' as const,
    },
    configPath: twConfigPaths,
  }, twModuleConfig))
}
