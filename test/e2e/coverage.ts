// Browser (V8) coverage for the editor code, mapped back to src/ through the composed source maps.
import MCR, { type CoverageReportOptions } from 'monocart-coverage-reports'

export const COVERAGE_OPTIONS: CoverageReportOptions = {
  name: 'nuxt-visual-editor e2e coverage',
  outputDir: 'coverage-e2e',
  reports: ['console-summary', 'v8', 'json-summary', 'json'],
  entryFilter: (entry) => entry.url.includes('/_nuxt/'),
  // Browser-executed editor code. src/runtime/core is gated at 100% by the unit suite.
  sourceFilter: (path) => /(^|\/)src\/app\//.test(path),
  sourcePath: (filePath) => {
    const i = filePath.indexOf('src/')
    return i === -1 ? filePath : filePath.slice(i)
  },
  cleanCache: false,
}

/** Thresholds for the e2e gate (percent). */
export const THRESHOLDS = { functions: 100, lines: 95, branches: 95 } as const

export async function addBrowserCoverage(
  entries: Array<{ url: string; source?: string; [key: string]: unknown }>,
) {
  // Only chunks whose source map points into src/app count; vendor-only chunks are ignored.
  const mapped = await Promise.all(
    entries
      .filter((e) => e.url.includes('/_nuxt/') && e.url.endsWith('.js'))
      .map(async (entry) => {
        const res = await fetch(`${entry.url}.map`).catch(() => null)
        if (!res?.ok) return null
        const sourceMap = (await res.json()) as { sources: string[] }
        return sourceMap.sources.some((s) => s.includes('/src/app/'))
          ? Object.assign(entry, { sourceMap })
          : null
      }),
  )
  const withMaps = mapped.filter(Boolean)
  if (withMaps.length) await MCR(COVERAGE_OPTIONS).add(withMaps as never)
}
