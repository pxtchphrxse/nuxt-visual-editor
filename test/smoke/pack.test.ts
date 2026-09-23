// Installs the packed tarball into brand-new Nuxt apps (npm and strict pnpm, Nuxt 3.21 and 4.5)
// with no other dependencies, then builds and serves them. This is what consumers experience.
import { execFileSync, spawn } from 'node:child_process'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../..', import.meta.url))
const MATRIX = [
  { manager: 'npm', nuxt: '3.21.11' },
  { manager: 'npm', nuxt: '4.5.2' },
  { manager: 'pnpm', nuxt: '3.21.11' },
  { manager: 'pnpm', nuxt: '4.5.2' },
] as const

let work = ''
let tarball = ''

beforeAll(async () => {
  work = await mkdtemp(join(tmpdir(), 've-smoke-'))
  execFileSync('pnpm', ['pack', '--pack-destination', work], { cwd: root, stdio: 'pipe' })
  tarball = join(
    work,
    (await readdir(work)).find((f) => f.endsWith('.tgz'))!,
  )
})

afterAll(async () => {
  if (work && !process.env.VE_KEEP_SMOKE) await rm(work, { recursive: true, force: true })
})

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer().listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number }
      server.close(() => resolve(port))
    })
  })
}

async function createApp(dir: string, nuxt: string, manager: 'npm' | 'pnpm') {
  await mkdir(join(dir, 'server/api'), { recursive: true })
  await writeFile(
    join(dir, 'package.json'),
    JSON.stringify(
      {
        name: 'smoke-app',
        private: true,
        type: 'module',
        dependencies: { nuxt: nuxt, 'nuxt-visual-editor': `file:${tarball}` },
      },
      null,
      2,
    ),
  )
  await writeFile(
    join(dir, 'nuxt.config.ts'),
    `export default defineNuxtConfig({
  modules: ['nuxt-visual-editor'],
  visualEditor: { containerClass: 'smoke-content' },
  ${nuxt.startsWith('3.') ? 'future: { compatibilityVersion: 4 },' : ''}
  compatibilityDate: '2026-09-01',
})\n`,
  )
  await mkdir(join(dir, 'app'), { recursive: true })
  await writeFile(
    join(dir, 'app/app.vue'),
    `<script setup>
const html = ref('<section data-ve-id="s" data-ve-v="2" class="pad" style="--pad-y: 1rem;"><p>Smoke</p><img src="x" onerror="alert(1)"></section>')
</script>
<template>
  <VisualEditor v-model="html" />
  <VisualEditorContent id="out" :html="html" />
</template>\n`,
  )
  await writeFile(
    join(dir, 'server/api/clean.post.ts'),
    `export default defineEventHandler(async (e) => ({ html: sanitizeVisualContent((await readBody(e)).html) }))\n`,
  )
  if (manager === 'pnpm') {
    // Own workspace (strict node_modules, no hoisting) with build scripts allowed for the toolchain.
    await writeFile(
      join(dir, 'pnpm-workspace.yaml'),
      "allowBuilds:\n  esbuild: true\n  '@parcel/watcher': true\n  vue-demi: true\n",
    )
  }
}

describe.each(MATRIX)('packed package with $manager + Nuxt $nuxt', ({ manager, nuxt }) => {
  it('installs, builds and serves with no extra dependencies', async () => {
    const dir = join(work, `${manager}-${nuxt}`)
    await createApp(dir, nuxt, manager)
    const run = (cmd: string, args: string[]) =>
      execFileSync(cmd, args, {
        cwd: dir,
        stdio: 'pipe',
        env: { ...process.env, CI: '1' },
      }).toString()

    run(manager, manager === 'npm' ? ['install', '--no-audit', '--no-fund'] : ['install'])
    // A fresh consumer must not need TypeScript or sass for the precompiled components.
    expect(() => run('node', ['-e', "require.resolve('typescript')"])).toThrow(
      /Cannot find module 'typescript'/,
    )
    run(`${dir}/node_modules/.bin/nuxi`, ['build'])

    const port = await freePort()
    const server = spawn(process.execPath, ['.output/server/index.mjs'], {
      cwd: dir,
      env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
    })
    try {
      const base = `http://127.0.0.1:${port}`
      let html = ''
      for (let i = 0; i < 100 && !html; i++) {
        html = await fetch(base)
          .then((r) => r.text())
          .catch(() => '')
        if (!html) await new Promise((r) => setTimeout(r, 200))
      }
      expect(html).toContain(
        '<div class="smoke-content" id="out"><section data-ve-id="s" data-ve-v="2" class="pad" style="--pad-y: 1rem;"><p>Smoke</p><img src="x"></section></div>',
      )
      expect(html).toContain('data-testid="visual-editor"')
      const api = await fetch(`${base}/api/clean`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ html: '<p onclick="x()">ok</p>' }),
      }).then((r) => r.json())
      expect(api).toEqual({ html: '<p>ok</p>' })
    } finally {
      server.kill('SIGTERM')
    }
  })
})
