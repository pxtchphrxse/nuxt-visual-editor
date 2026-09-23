# Changelog

## 2.0.0-rc.0

A rewrite. See [MIGRATION.md](./MIGRATION.md) for upgrading from 0.1.x.

### Breaking changes

- Tailwind CSS is no longer used or installed into your app; the editor UI is styled with scoped SCSS and saved content with a small class vocabulary + CSS custom properties, scoped under a configurable `containerClass`.
- New saved HTML format (`data-ve-id`, `data-ve-v="2"`); v1 content is migrated automatically on load (`migrateV1`).
- Options: `image_providers` removed; `theme` keys renamed (`brand`, `link`, `surface`, `text`, `muted`, `border`, `error`, `success`).
- Custom components: `imageSrc` renamed to `preview`. The built-in library is now imported from `nuxt-visual-editor/library`.
- Requires Nuxt `>=3.21.0` (Nuxt 4 supported) and Node.js `^22.22.2 || ^24.15.0 || >=26`.

### Features

- `mode: 'styles'` for sites that only render content, and `<VisualEditorContent>` for rendering it.
- DOMPurify sanitization on load, on every edit (debounced by `sanitizeDebounceMs`) and on render; `sanitizeVisualContent()` / `sanitizeVisualContentDetailed()` auto-imported in the app and in Nitro.
- `sanitized` and `migrate` events; `flush()` exposed on the editor.
- Real two-way `v-model`; SSR-safe (no `<ClientOnly>` needed); several editors per page.
- Design tokens (`fonts`, `palette`, `spacing`, `fontSizes`), editor `theme`, `assetsBaseURL` (respects `app.baseURL`).
- Rewritten 17-component library with generated previews (7.7 MB → ~210 KB).
- Undo for deleted sections, select-parent, keyboard support (Escape to deselect), inline validation errors.

### Fixes (from the v1 compatibility review)

- Installs and builds in fresh apps with npm and strict pnpm; no TypeScript or Sass needed (components are precompiled).
- Works regardless of module order; no global CSS (preflight, links, scrollbars, form resets) leaks into the host app.
- Link text colour, `not-italic`, invalid `min-h-[7]` and other v1 styling bugs.

### Tooling

- pnpm 12, Vite 8, oxlint + oxfmt (ESLint removed), Vitest 5, Playwright; `@nuxt/module-builder` replaced by a Vite build.
- 0 known vulnerabilities and 0 deprecated packages, enforced in CI (`pnpm audit:deps`).
- Unit (100% coverage), end-to-end (browser coverage gate) and packed-tarball smoke tests on Nuxt 3.21 and 4.5.

## 0.1.5

- change mouse event to show components menu

## 0.1.4

- fix vuedraggable problem by disabling it
- fix `vue` useId not a function problem by implement custom `useRandomId` composable and use `<ClientOnly>` to prevent Vue mismatched DOM warnings
- update preview styles
- change @tailwindcss/forms strategy
- update default categories to match a default components

## 0.1.3

- invalid package version

## 0.1.2

- fix main.css not found
- change nuxt-headless ui to normal dependencies

## 0.1.1

- Change default logo to text

## 0.1.0

- Add the ability to use the editor as a component.
- Make the Visual Editor reusable multiple times on the same page by changing the DOM selector from the original author’s implementation.
