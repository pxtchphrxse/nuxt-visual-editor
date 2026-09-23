// Builds a fixture with its own `nuxi` (so Nuxt 3 and 4 fixtures use their own Nuxt) and runs
// the production server, exactly as a consumer would deploy it.
import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'

export interface RunningFixture {
  name: string
  url: string
  stop: () => Promise<void>
}

const BASE_URLS: Record<string, string> = { 'base-url': '/admin/' }

export const fixtureDir = (name: string) =>
  fileURLToPath(new URL(`../fixtures/${name}/`, import.meta.url))

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number }
      server.close(() => resolve(port))
    })
  })
}

async function waitFor(url: string, child: ChildProcess, log: () => string) {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Fixture server exited early:\n${log()}`)
    try {
      const res = await fetch(url)
      if (res.status < 500) return
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Timed out waiting for ${url}:\n${log()}`)
}

export async function startFixture(name: string): Promise<RunningFixture> {
  const cwd = fixtureDir(name)
  const nuxi = `${cwd}node_modules/.bin/nuxi`
  if (!existsSync(nuxi)) throw new Error(`Fixture "${name}" is not installed (${nuxi} missing)`)
  if (!process.env.VE_SKIP_FIXTURE_BUILD) {
    execFileSync(nuxi, ['build'], {
      cwd,
      stdio: process.env.CI ? 'inherit' : 'pipe',
      env: { ...process.env, NODE_ENV: 'production' },
    })
  }
  const port = await freePort()
  let output = ''
  const child = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout!.on('data', (d) => {
    output += d
  })
  child.stderr!.on('data', (d) => {
    output += d
  })
  const url = `http://127.0.0.1:${port}${BASE_URLS[name] ?? '/'}`
  await waitFor(url, child, () => output)
  return {
    name,
    url,
    stop: () =>
      new Promise((resolve) => {
        if (child.exitCode !== null) return resolve()
        child.once('exit', () => resolve())
        child.kill('SIGTERM')
      }),
  }
}
