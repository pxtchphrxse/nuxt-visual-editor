import { rm } from 'node:fs/promises'
import MCR from 'monocart-coverage-reports'
import type { TestProject } from 'vitest/node'
import { COVERAGE_OPTIONS, THRESHOLDS } from './coverage'
import { startFixture, type RunningFixture } from './fixtures'

declare module 'vitest' {
  export interface ProvidedContext {
    /** Fixture name -> base URL. `editor` is the fixture the editor suites run against. */
    fixtures: Record<string, string>
  }
}

export default async function setup(project: TestProject) {
  const nuxtMajor = process.env.VE_NUXT_MAJOR ?? '4'
  const editor = nuxtMajor === '3' ? 'nuxt3' : 'nuxt4'
  // The Nuxt 3 job only runs the editor suites; the integration fixtures are Nuxt 4 apps.
  const names = nuxtMajor === '3' ? [editor] : [editor, 'styles-only', 'base-url', 'host-tailwind']
  await rm(COVERAGE_OPTIONS.outputDir!, { recursive: true, force: true })

  const running: RunningFixture[] = []
  for (const name of names) running.push(await startFixture(name))
  const urls = Object.fromEntries(running.map((f) => [f.name, f.url]))
  project.provide('fixtures', { ...urls, editor: urls[editor]! })

  return async () => {
    await Promise.all(running.map((f) => f.stop()))
    if (process.env.VE_E2E_COVERAGE === '0') return
    const results = await MCR(COVERAGE_OPTIONS).generate()
    const summary = results?.summary
    if (!summary) throw new Error('No e2e coverage was collected')
    const failures = (Object.keys(THRESHOLDS) as Array<keyof typeof THRESHOLDS>)
      .filter((metric) => (summary[metric].pct as number) < THRESHOLDS[metric])
      .map((metric) => `${metric} ${summary[metric].pct}% < ${THRESHOLDS[metric]}%`)
    if (failures.length) throw new Error(`E2E coverage below threshold: ${failures.join(', ')}`)
  }
}
