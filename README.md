<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Nuxt Visual Editor
- Package name: nuxt-visual-editor
- Description: My new Nuxt module
-->

# Nuxt Visual Editor

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt visual (layout) editor components rewrite from [vue-drag-and-drop-page-builder][ref-repo-src] with [`typescript`][typescript-src], [`nuxt-headlessui`][nuxt-headlessui-src] and [`tailwindcss`][tailwindcss-src]

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-visual-editor?file=playground%2Fapp.vue) -->
  <!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Quick Setup

1. Install using NPM or Yarn

```bash
npm install nuxt-visual-editor
```

**OR**

```bash
yarn add nuxt-visual-editor
```

2. Add `nuxt-visual-editor` to the `modules` section of `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-visual-editor"],
  // default options
  visualEditor: {
    image_providers: { base64: true },
    theme: {
      myPrimaryBrandColor: "#000000",
      myPrimaryLinkColor: "#2563eb",
      myPrimaryLightGrayColor: "#e2e8f0",
      myPrimaryMediumGrayColor: "#9ca3af",
      myPrimaryDarkGrayColor: "#111827",
      myPrimaryErrorColor: "#d60000",
      myPrimarySuccesColor: "#16a34a",
    },
  },
});
```

That's it! You can now use Nuxt Visual Editor in your Nuxt app ✨

```vue
<template>
  <VisualEditor />
</template>
```

## Props

| Name       | Type                      | Description                                                    |
| ---------- | ------------------------- | -------------------------------------------------------------- |
| modelValue | string `v-model`          | initial value to be rendered                                   |
| components | [Component](#component)[] | a custom components list                                       |
| categories | string[]                  | a custom categories list (Used to group components in a menu.) |

### Component

| Property | Type   | Description                                                                             |
| -------- | ------ | --------------------------------------------------------------------------------------- |
| name     | string | component's name                                                                        |
| category | string | component's category name                                                               |
| imageSrc | string | component's preview image                                                               |
| html     | string | component's html conntent (There must always be one <section> tag as the root element.) |

## Events

| Name              | Parameters | Description                        |
| ----------------- | ---------- | ---------------------------------- |
| update:modelValue | html       | html value emitted on edit content |

## Example

### Example - Basic Usage with custom components & categories

```vue
<template>
  <VisualEditor
    v-model="html"
    :components="components"
    :categories="categories"
  />
</template>

<script setup lang="ts">
const html = ref("");
const components = ref([
  {
    name: "paragraphs",
    category: "text",
    imageSrc: "paragraphs.png",
    html: '<section class="text-gray-500"> <p>Paragraph 1</p> <p>Paragraph 2</p> <p>Paragraph 3</p> </section>',
  },
  {
    name: "avatar",
    category: "image",
    imageSrc: "avatar.png",
    html: '<section> <img class="aspect-square" alt="" src="placeholder_image.jpg" > </section>',
  },
]);
</script>
```

## WIP

- custom slots
- custom image providers
- true two-way binding (currently partial)

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-visual-editor/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-visual-editor
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-visual-editor.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-visual-editor
[license-src]: https://img.shields.io/npm/l/nuxt-visual-editor.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-visual-editor
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
[ref-repo-src]: https://github.com/qaiswardag/vue-drag-and-drop-page-builder
[typescript-src]: https://www.typescriptlang.org
[nuxt-headlessui-src]: https://nuxt.com/modules/headlessui
[tailwindcss-src]: https://tailwindcss.com
