// Fails when any package resolved in pnpm-lock.yaml is marked deprecated on the registry.
// pnpm records the registry's `deprecated` message for each package in the lockfile.
import { readFileSync } from 'node:fs'

const lock = readFileSync(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')
const deprecated: string[] = []
let current = ''

for (const line of lock.split('\n')) {
  const header = line.match(/^ {2}'?([^\s'][^']*?)'?:$/)
  if (header?.[1]) current = header[1]
  const msg = line.match(/^ {4}deprecated: (.+)$/)
  if (msg && current) deprecated.push(`${current}: ${msg[1]}`)
}

if (deprecated.length) {
  console.error(`Found ${deprecated.length} deprecated package(s):\n  ${deprecated.join('\n  ')}`)
  process.exit(1)
}
console.log('No deprecated packages in pnpm-lock.yaml')
