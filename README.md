# Nuxt Visual Editor

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A drag-free visual (layout) editor for Nuxt. Editors build pages from sections, select any element and adjust text, links, images, typography, colours, spacing and borders. The output is portable HTML whose styling is carried by a tiny, scoped class vocabulary and CSS custom properties, and which is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) on the way in and on the way out.

- **No Tailwind, no global CSS.** Editor styles are scoped to the editor; content styles are scoped to one container class you choose.
- **Safe by default.** Content is sanitized on load, on every edit (debounced) and when rendered, and a sanitizer is auto-imported for your server routes.
- **Nuxt 3.21+ and Nuxt 4**, npm/pnpm/yarn, no TypeScript or Sass required in your app.
- **Migrates v1 content** (Tailwind classes) automatically when it is loaded.

- [✨ Release notes](./CHANGELOG.md)
- [↗ Migrating from v1](./MIGRATION.md)

## Requirements

- Nuxt `>=3.21.0` (Nuxt 4 recommended)
- Node.js `^22.22.2 || ^24.15.0 || >=26`

## Setup

```bash
pnpm add nuxt-visual-editor    # or: npm install / yarn add
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-visual-editor'],
  visualEditor: {
    // all options are optional; see "Options" below
  },
})
```

## Editing

```vue
<script setup lang="ts">
const html = ref('')
</script>

<template>
  <div style="height: 80vh">
    <VisualEditor v-model="html" @sanitized="(changes) => console.warn(changes)" />
  </div>
</template>
```

The editor fills its parent's height. It is SSR-safe (content is loaded in the browser), so `<ClientOnly>` is not needed.

### Props

| Prop         | Type                    | Description                                                           |
| ------------ | ----------------------- | --------------------------------------------------------------------- |
| `v-model`    | `string`                | The document. Emitted only after sanitization.                        |
| `components` | `ComponentDefinition[]` | Library shown in the sidebar. Defaults to the 17 built-in components. |
| `categories` | `string[]`              | Category order. Defaults to the categories used by `components`.      |

```ts
interface ComponentDefinition {
  name: string
  category: string
  preview?: string // image URL; `{{assets}}` resolves to the module's assets URL
  html: string // exactly one root <section>
}
```

Extend or reuse the built-in library:

```ts
import { DEFAULT_COMPONENTS } from 'nuxt-visual-editor/library'

const components = [
  ...DEFAULT_COMPONENTS,
  { name: 'Banner', category: 'custom', html: '<section>…</section>' },
]
```

### Events

| Event               | Payload            | When                                                               |
| ------------------- | ------------------ | ------------------------------------------------------------------ |
| `update:modelValue` | `string`           | After an edit (debounced by `sanitizeDebounceMs`, flushed on blur) |
| `sanitized`         | `SanitizeChange[]` | The sanitizer removed elements, attributes, styles or classes      |
| `migrate`           | `MigrationReport`  | v1 content was converted on load                                   |

The component also exposes `flush()` to emit a pending change immediately (for example before saving).

## Rendering saved content

```vue
<template>
  <VisualEditorContent :html="page.body" />
</template>
```

`<VisualEditorContent>` wraps the HTML in the container class and sanitizes it (on the server during SSR, and in the browser). If you already sanitize on save, pass `trusted` to skip it. `tag` picks the wrapper (`div`, `article`, `section`, `main`, `aside`).

Rendering on a site that never edits? Use `mode: 'styles'`: only the content stylesheet, `<VisualEditorContent>` and the sanitizer are registered, with no editor code or assets.

## Sanitizing on the server

`sanitizeVisualContent(html)` is auto-imported in your app **and** in Nitro, so you can clean content before it is stored:

```ts
// server/api/pages/[id].put.ts
export default defineEventHandler(async (event) => {
  const { html } = await readBody<{ html: string }>(event)
  const clean = sanitizeVisualContent(html)
  // … save `clean`
})
```

`sanitizeVisualContentDetailed(html)` also returns the list of removed items. The policy:

- tags limited to structural and text elements, `a` and `img`; no scripts, SVG, forms, iframes or media
- `href`: `http(s)`, `mailto:`, `tel:` or a relative path; `target="_blank"` always gets `rel="noopener noreferrer"`
- `img[src]`: `https://`, relative, or base64 PNG/JPEG/GIF/WebP data URIs (never SVG)
- `style`: only the vocabulary's custom properties, each with a strict value validator
- `class`: valid CSS identifiers (`allowCustomClasses: false` restricts them to the vocabulary)

On the server the sanitizer uses [jsdom](https://github.com/jsdom/jsdom); it is kept out of your client bundle.

## Content format

Saved HTML is a list of sections. Styling is expressed with a small class vocabulary driven by inline custom properties:

```html
<section data-ve-id="…" data-ve-v="2" class="pad bg" style="--pad-y: 5rem; --bg: #10b981;">
  <h2 class="fs fw" style="--fs: 2.25rem; --fs-md: 3rem; --fw: 700;">Hello</h2>
</section>
```

| Class                                         | Variables                                                           |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `pad`, `mar`                                  | `--pad-y` `--pad-x`, `--mar-y` `--mar-x`                            |
| `bg`, `fg`, `op`                              | `--bg` `--bg-a` (opacity), `--fg`, `--op`                           |
| `fs`                                          | `--fs`, `--fs-sm` (≥640px), `--fs-md` (≥768px), `--fs-lg` (≥1024px) |
| `fw`, `ff`, `fst`, `ta`, `lh`                 | weight, family token, style, alignment, line height                 |
| `bd`, `rad`                                   | `--bd-s` `--bd-w` `--bd-c`, `--r` and per-corner `--r-tl` …         |
| `wrap`, `stack`, `row`, `grid`, `span`, `img` | layout primitives used by components                                |

Every rule is scoped under your container class (`.ve-content` by default, `:where()` keeps specificity low), so content styles never touch the rest of your site and your site's global CSS affects content only as much as it affects any other markup. Changing `containerClass` never requires touching stored HTML.

## Options

| Option               | Default             | Description                                                                                        |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| `mode`               | `'editor'`          | `'styles'` registers only the content stylesheet, `<VisualEditorContent>` and the sanitizer        |
| `containerClass`     | `'ve-content'`      | Class of the element that wraps rendered content                                                   |
| `tokens.fonts`       | `{}`                | Extra font families, used by content as `var(--ve-font-<name>)` (`sans`, `serif`, `mono` built in) |
| `tokens.palette`     | 34 colours          | Swatches offered by the colour pickers (hex)                                                       |
| `tokens.spacing`     | `0`…`8rem`          | Spacing scale offered for padding and margin                                                       |
| `tokens.fontSizes`   | `xs`…`9xl`          | Font size scale offered by the typography panel                                                    |
| `theme`              | neutral             | Editor UI colours: `brand`, `link`, `surface`, `text`, `muted`, `border`, `error`, `success` (hex) |
| `assetsBaseURL`      | `'/_visual-editor'` | Where preview images and the placeholder are served (below `app.baseURL`)                          |
| `migrateV1`          | `true`              | Convert v1 (Tailwind) content when it is loaded                                                    |
| `sanitizeDebounceMs` | `300`               | Debounce between an edit and its sanitized `update:modelValue`                                     |

## Development

```bash
pnpm install
pnpm dev             # build the package and start the playground
pnpm lint            # oxlint
pnpm format          # oxfmt
pnpm typecheck
pnpm test:unit       # core, sanitizer, migrator, CSS build (100% coverage gate)
pnpm test:e2e        # Playwright against real Nuxt builds (+ browser coverage gate)
pnpm test:smoke      # packed tarball in fresh npm/pnpm apps on Nuxt 3.21 and 4.5
pnpm audit:deps      # no known vulnerabilities, no deprecated packages
pnpm previews        # regenerate library preview images
```

The Nuxt 3 end-to-end run uses its own install: `pnpm test:fixtures:nuxt3 && VE_NUXT_MAJOR=3 pnpm test:e2e`.

### Releasing

Publishing happens in CI (`.github/workflows/release.yml`) when a version tag is pushed:

```bash
pnpm release                 # local checks
npm version 2.0.0-rc.1       # bumps package.json, commits, tags v2.0.0-rc.1
git push --follow-tags       # the release workflow runs full CI, then publishes
```

Prereleases (`x.y.z-rc.n`) are published under the `next` dist-tag, stable versions under `latest`. The workflow uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) with provenance, so no npm token is stored in the repository.

## License

MIT. Icons from [Heroicons](https://heroicons.com) (MIT). The v1 migrator embeds the Tailwind CSS v3 colour palette (MIT) to convert old content.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-visual-editor/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-visual-editor
[license-src]: https://img.shields.io/npm/l/nuxt-visual-editor.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-visual-editor
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
