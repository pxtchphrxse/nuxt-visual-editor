// Editor state and actions, provided to every editor component.
//
// The live DOM inside the canvas is the source of truth while editing: sections are rendered once
// from `section.html` and then edited in place. `section.html` is only replaced (and the section
// re-rendered via `epoch`) when content is loaded or when the sanitizer changes something, so the
// selection and DOM identity survive ordinary edits.
import { computed, inject, provide, ref, shallowRef, type InjectionKey } from 'vue'
import {
  instantiateComponent,
  parseSections,
  readVars,
  serializeSection,
  type ElementVars,
  type SectionModel,
} from '#visual-editor/core/document'
import { isV1Content, migrateV1 } from '#visual-editor/core/migrate-v1'
import { sanitizeVisualContentDetailed } from '#visual-editor/sanitize'
import type { MigrationReport } from '../runtime/core/migrate-v1'
import type { SanitizeChange } from '../runtime/core/sanitize'
import type { PublicVisualEditorConfig } from '../options'

export interface ComponentDefinition {
  name: string
  category: string
  /** Preview image URL; `{{assets}}` is replaced by the module's assets base URL. */
  preview?: string
  /** Markup with exactly one root <section>. */
  html: string
}

export interface LiveSection extends SectionModel {
  /** Bumped to force a re-render from `html`. */
  epoch: number
}

export interface EditorHooks {
  onModel: (html: string) => void
  onSanitized: (changes: SanitizeChange[]) => void
  onMigrate: (report: MigrationReport) => void
}

export function createEditor(
  config: PublicVisualEditorConfig,
  assetsBase: string,
  hooks: EditorHooks,
) {
  const sections = ref<LiveSection[]>([])
  const canvas = shallowRef<HTMLElement | null>(null)
  const selected = shallowRef<HTMLElement | null>(null)
  const revision = ref(0)
  const lastDeleted = shallowRef<{ section: SectionModel; index: number } | null>(null)
  let lastEmitted: string | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const sectionEl = (id: string) =>
    canvas.value?.querySelector<HTMLElement>(`section[data-ve-id="${CSS.escape(id)}"]`) ?? null

  const currentHtml = (section: LiveSection) => {
    const el = sectionEl(section.id)
    return el ? serializeSection(el) : section.html
  }

  function select(el: HTMLElement | null) {
    selected.value?.removeAttribute('data-ve-selected')
    el?.setAttribute('data-ve-selected', '')
    selected.value = el
    revision.value++
  }

  /** Serializes, sanitizes and emits. Sections the sanitizer changed are re-rendered. */
  function sync() {
    clearTimeout(timer)
    timer = undefined
    const parts: string[] = []
    for (const section of sections.value) {
      const el = sectionEl(section.id)
      const result = sanitizeVisualContentDetailed(currentHtml(section))
      if (result.changes.length) {
        hooks.onSanitized(result.changes)
        if (selected.value && el?.contains(selected.value)) select(null)
        section.html = result.html
        section.epoch++
      }
      parts.push(result.html)
    }
    const html = parts.join('\n')
    if (html !== lastEmitted) {
      lastEmitted = html
      hooks.onModel(html)
    }
  }

  function scheduleSync() {
    clearTimeout(timer)
    timer = setTimeout(sync, config.sanitizeDebounceMs)
  }

  /** Runs a pending sync immediately (on blur and unmount). */
  function flush() {
    if (timer !== undefined) sync()
  }

  /** Loads external content: v1 migration, sanitization, section parsing. */
  function load(html: string) {
    clearTimeout(timer)
    timer = undefined
    let input = html
    if (config.migrateV1 && isV1Content(input)) {
      const migrated = migrateV1(input)
      input = migrated.html
      hooks.onMigrate(migrated.report)
    }
    const result = sanitizeVisualContentDetailed(input)
    if (result.changes.length) hooks.onSanitized(result.changes)
    const parsed = parseSections(result.html) as LiveSection[]
    for (const section of parsed) section.epoch = 0
    sections.value = parsed
    select(null)
    lastDeleted.value = null
    lastEmitted = html
    // Emit the normalised document (ids, version markers, migration) if it differs.
    const normalised = sections.value.map((s) => s.html).join('\n')
    if (normalised !== html) {
      lastEmitted = normalised
      hooks.onModel(normalised)
    }
  }

  /** True when `html` is what the editor last emitted or loaded (no reload needed). */
  const isCurrent = (html: string) => html === lastEmitted

  function mutate(fn: () => void) {
    fn()
    revision.value++
    scheduleSync()
  }

  function addComponent(definition: ComponentDefinition, index = sections.value.length) {
    const section = instantiateComponent(definition.html, assetsBase)
    sections.value.splice(index, 0, { ...section, epoch: 0 })
    lastDeleted.value = null
    scheduleSync()
    return section.id
  }

  function removeSection(id: string) {
    const index = sections.value.findIndex((s) => s.id === id)
    const section = sections.value[index]
    if (!section) return
    if (selected.value && sectionEl(id)?.contains(selected.value)) select(null)
    lastDeleted.value = { section: { id, html: currentHtml(section) }, index }
    sections.value.splice(index, 1)
    scheduleSync()
  }

  function restoreSection() {
    const deleted = lastDeleted.value
    if (!deleted) return
    const index = Math.min(deleted.index, sections.value.length)
    sections.value.splice(index, 0, { ...deleted.section, epoch: 0 })
    lastDeleted.value = null
    scheduleSync()
  }

  function moveSection(id: string, direction: -1 | 1) {
    const index = sections.value.findIndex((s) => s.id === id)
    const target = index + direction
    if (index === -1 || target < 0 || target >= sections.value.length) return
    const list = sections.value
    ;[list[index], list[target]] = [list[target]!, list[index]!]
    scheduleSync()
  }

  /** Sanitized HTML of the current document (for preview). */
  const previewHtml = () =>
    sections.value.map((s) => sanitizeVisualContentDetailed(currentHtml(s)).html).join('\n')

  const vars = computed<ElementVars | null>(() => {
    void revision.value
    return selected.value ? readVars(selected.value) : null
  })

  return {
    config,
    assetsBase,
    sections,
    canvas,
    selected,
    revision,
    lastDeleted,
    vars,
    select,
    mutate,
    load,
    isCurrent,
    flush,
    addComponent,
    removeSection,
    restoreSection,
    moveSection,
    previewHtml,
  }
}

export type Editor = ReturnType<typeof createEditor>

const EDITOR: InjectionKey<Editor> = Symbol('nuxt-visual-editor')

export function provideEditor(editor: Editor) {
  provide(EDITOR, editor)
}

export function useEditor(): Editor {
  const editor = inject(EDITOR)
  if (!editor)
    throw new Error('[nuxt-visual-editor] useEditor() must be used inside <VisualEditor>')
  return editor
}

/** Joins the assets base (below app.baseURL) into a URL path. */
export function joinBase(appBase: string, path: string): string {
  return `${appBase.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
