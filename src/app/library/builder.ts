// Tiny HTML builder for the built-in component library. Vocabulary classes are derived from the
// variables used, so markup cannot drift from the schema. Text arguments are trusted literals.
import { CLASS_OF_VAR, type StyleVar } from '../../runtime/core/schema'

export type Vars = Partial<Record<StyleVar, string>>

function attrs(layout: string, vars: Vars, extra = ''): string {
  const classes = new Set(layout.split(' ').filter(Boolean))
  for (const name of Object.keys(vars) as StyleVar[]) {
    const cls = CLASS_OF_VAR[name]
    if (cls) classes.add(cls)
  }
  const style = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ')
  return `${classes.size ? ` class="${[...classes].join(' ')}"` : ''}${style ? ` style="${style}"` : ''}${extra}`
}

export const h = (tag: string, layout: string, vars: Vars, ...children: string[]) =>
  `<${tag}${attrs(layout, vars)}>${children.join('')}</${tag}>`

export const img = (vars: Vars, alt = '') =>
  `<img${attrs('img', vars, ` src="{{assets}}/placeholder_image.jpg" alt="${alt}"`)}>`

export const link = (href: string, text: string, vars: Vars = {}) =>
  `<a${attrs('', vars, ` href="${href}"`)}>${text}</a>`

export const section = (vars: Vars, ...children: string[]) => h('section', '', vars, ...children)
