import { describe, expect, it } from 'vitest'
import {
  BREAKPOINTS,
  CLASS_OF_VAR,
  CLASS_VARS,
  STYLE_VARS,
  VOCABULARY_CLASSES,
  isStyleVar,
  isValidVarValue,
} from '../../src/runtime/core/schema'

describe('schema', () => {
  it.each([
    ['--pad-y', '2rem', true],
    ['--pad-y', '1rem 2rem', true],
    ['--pad-y', '1rem 2rem 3rem', false],
    ['--pad-x', 'calc(1px)', false],
    ['--mar-x', 'auto', true],
    ['--mar-y', 'auto', true],
    ['--mar-y', 'nope', false],
    ['--mar-y', '-0.5rem', true],
    ['--bg', '#10b981', true],
    ['--bg', '#10b98180', true],
    ['--bg', 'red', false],
    ['--bg', 'url(x)', false],
    ['--bg', 'transparent', true],
    ['--fg', 'currentColor', true],
    ['--bg-a', '0.5', true],
    ['--bg-a', '1.5', false],
    ['--bg-a', '', false],
    ['--op', '-1', false],
    ['--fs', '2.25rem', true],
    ['--fs', 'auto', true],
    ['--fs', 'expression(alert(1))', false],
    ['--fw', '700', true],
    ['--fw', '750', false],
    ['--ff', 'var(--ve-font-serif)', true],
    ['--ff', 'var(--x)', false],
    ['--ff', 'Comic Sans', false],
    ['--fst', 'italic', true],
    ['--ta', 'center', true],
    ['--lh', '1.5', true],
    ['--lh', '24px', true],
    ['--bd-s', 'dashed', true],
    ['--bd-s', 'groove', false],
    ['--cols', '12', true],
    ['--cols', '13', false],
    ['--cols', '0', false],
    ['--cols', '2.5', false],
    ['--justify', 'space-between', true],
    ['--fit', 'contain', true],
    ['--unknown', '1', false],
  ])('%s: %s -> %s', (name, value, ok) => {
    expect(isValidVarValue(name, value)).toBe(ok)
  })

  it('trims values before validating', () => {
    expect(isValidVarValue('--bg', '  #fff ')).toBe(true)
  })

  it('knows which strings are style vars', () => {
    expect(isStyleVar('--pad-y')).toBe(true)
    expect(isStyleVar('toString')).toBe(false)
    expect(isStyleVar('--nope')).toBe(false)
  })

  it('maps every editable var back to its class', () => {
    for (const [cls, vars] of Object.entries(CLASS_VARS)) {
      for (const v of vars) expect(CLASS_OF_VAR[v]).toBe(cls)
      expect(VOCABULARY_CLASSES).toContain(cls)
    }
    for (const v of Object.keys(CLASS_OF_VAR)) expect(STYLE_VARS).toHaveProperty(v)
  })

  it('uses the breakpoints the stylesheet uses', () => {
    expect(BREAKPOINTS).toEqual({ sm: 640, md: 768, lg: 1024 })
  })
})
