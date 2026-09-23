# Nuxt 3 fixture

Installed separately from the workspace (`pnpm --dir test/fixtures/nuxt3 install`; its own `pnpm-workspace.yaml` makes it a separate workspace)
and consumes the built package through `file:`, like a real Nuxt 3 app.

Nuxt 3.21 depends on `unplugin-vue-router@0.19.x`, which is deprecated upstream (merged into
vue-router 5). That is part of Nuxt 3 itself, not of this module, so it is kept out of the root
lockfile that `scripts/check-deprecated.ts` enforces.
