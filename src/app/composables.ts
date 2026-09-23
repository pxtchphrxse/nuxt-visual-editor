import { computed, type WritableComputedRef } from 'vue'
import { getVar, setVar } from '#visual-editor/core/document'
import type { StyleVar } from '../runtime/core/schema'
import { useEditor } from './context'

/** Two-way binding to one vocabulary variable of `el` ('' = unset). */
export function useVarModel(el: HTMLElement, name: StyleVar): WritableComputedRef<string> {
  const editor = useEditor()
  return computed({
    get: () => {
      void editor.revision.value
      return getVar(el, name) ?? ''
    },
    set: (value) => editor.mutate(() => setVar(el, name, value || null)),
  })
}

export interface Option {
  label: string
  value: string
}

export const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ label: v, value: v }))
