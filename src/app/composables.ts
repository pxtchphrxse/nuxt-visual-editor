import { computed, type WritableComputedRef } from 'vue'
import { setVar } from '#visual-editor/core/document'
import type { StyleVar } from '../runtime/core/schema'
import { useEditor } from './context'

/** Two-way binding to one vocabulary variable of the selected element ('' = unset). */
export function useVarModel(name: StyleVar): WritableComputedRef<string> {
  const editor = useEditor()
  return computed({
    get: () => editor.vars.value?.[name] ?? '',
    set: (value) => {
      const el = editor.selected.value
      if (el) editor.mutate(() => setVar(el, name, value || null))
    },
  })
}

export interface Option {
  label: string
  value: string
}

export const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ label: v, value: v }))
