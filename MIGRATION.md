# Migrating from v1 to v2

v2 is a rewrite. The editor no longer uses Tailwind CSS, the saved HTML format changed, and the package now works in any Nuxt 3.21+ or Nuxt 4 app without extra dependencies. Existing v1 content keeps working: it is converted when it is loaded into the editor.

## 1. Requirements

|              | v1                                                               | v2                                 |
| ------------ | ---------------------------------------------------------------- | ---------------------------------- |
| Nuxt         | declared `>=3.0.0` (actually needed ~3.13)                       | `>=3.21.0`, Nuxt 4 supported       |
| Node.js      | 20                                                               | `^22.22.2 \|\| ^24.15.0 \|\| >=26` |
| Tailwind CSS | installed into your app (`@nuxtjs/tailwindcss` v6 + Tailwind v3) | not used                           |

## 2. Your app no longer gets Tailwind from this module

v1 installed `@nuxtjs/tailwindcss` into your app and injected Tailwind's preflight, `@tailwindcss/forms` base styles and a global link colour. v2 installs nothing and adds no global CSS. If your own pages relied on Tailwind arriving through this module, add it to your app explicitly (Tailwind v4 via `@tailwindcss/vite` works alongside v2).

## 3. Update the module options

```diff
 visualEditor: {
-  image_providers: { base64: true },
-  theme: {
-    myPrimaryBrandColor: '#000000',
-    myPrimaryLinkColor: '#2563eb',
-    myPrimaryLightGrayColor: '#e2e8f0',
-    myPrimaryMediumGrayColor: '#9ca3af',
-    myPrimaryDarkGrayColor: '#111827',
-    myPrimaryErrorColor: '#d60000',
-    myPrimarySuccesColor: '#16a34a',
-  },
+  theme: {
+    brand: '#000000',
+    link: '#2563eb',
+    border: '#e2e8f0',
+    muted: '#9ca3af',
+    text: '#111827',
+    error: '#d60000',
+    success: '#16a34a',
+  },
 }
```

- `image_providers` is gone: uploads are always stored as base64 PNG/JPEG/GIF/WebP; SVG uploads are rejected.
- New options: `containerClass`, `mode`, `tokens`, `assetsBaseURL`, `migrateV1`, `sanitizeDebounceMs` (see the README).

## 4. Update component usage

```diff
-<ClientOnly>
-  <VisualEditor v-model="html" :components="components" :categories="categories" />
-</ClientOnly>
+<VisualEditor v-model="html" :components="components" :categories="categories" />
```

- `<ClientOnly>` is no longer needed.
- `v-model` is now truly two-way: changing the value from outside reloads the editor.
- `update:modelValue` is emitted after sanitization, debounced (`sanitizeDebounceMs`) and flushed on blur/unmount.
- New events: `sanitized`, `migrate`.

Custom components use the same shape (`name`, `category`, `html`), with `imageSrc` renamed to `preview`:

```diff
-{ name: 'Hero', category: 'headers', imageSrc: '/previews/hero.png', html: '<section class="py-20">…</section>' }
+{ name: 'Hero', category: 'headers', preview: '/previews/hero.png', html: '<section class="pad" style="--pad-y: 5rem;">…</section>' }
```

Custom component HTML should use the v2 vocabulary (see "Content format" in the README). Tailwind classes in custom components are kept, but they are only styled if your app ships Tailwind itself.

The built-in library moved:

```diff
-import defaultComponents from '#visual-editor/utils/default-components'
+import { DEFAULT_COMPONENTS } from 'nuxt-visual-editor/library'
```

## 5. Render saved content with `<VisualEditorContent>`

v1 HTML depended on your app's Tailwind build to look right. v2 HTML is styled by the module's content stylesheet, scoped to the container class:

```vue
<VisualEditorContent :html="page.body" />
```

Sites that only display content can use `mode: 'styles'`.

## 6. Existing content

When v1 HTML is loaded into the editor (`migrateV1: true`, the default), it is converted and the next emitted value is v2:

- `data-componentid` becomes `data-ve-id`, and sections get `data-ve-v="2"`
- classes the v1 editor could set are mapped to the vocabulary: `py-*`, `px-*`, `my-*`, `mx-*`, `p-*`, `m-*`, text sizes (including `sm:`/`md:`/`lg:`), text/background/border colours, `bg-opacity-*`, `opacity-*`, font weight/family/style, border style/width, `rounded-*`, plus common layout (`grid`, `grid-cols-*`, `col-span-*`, `gap-*`, `flex`, `flex-col`, `items-*`, `justify-*`, `max-w-*`, `text-left|center|right`, `object-*`)
- v1 inline custom colours (`background-color` / `color`) become `--bg` / `--fg`
- the v1 bugs `non-italic` and `min-h-[7]` are fixed

Classes without an equivalent (for example `tracking-tight`, `absolute`, gradients) are **kept** on the element and listed in the `migrate` event's `unknownClasses`, so you can decide how to handle them. To convert stored content in bulk, load each document into the editor once and save what it emits.

## 7. Security changes you may notice

Content is sanitized with DOMPurify. Things v1 allowed that v2 removes: scripts, event handler attributes, `javascript:` and `data:` links, SVG, iframes, forms, and inline styles other than the vocabulary's custom properties. Use `sanitizeVisualContent()` (auto-imported, also in Nitro) to clean content on your server before storing it.
