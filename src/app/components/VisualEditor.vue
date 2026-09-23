<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import type { MigrationReport } from '../../runtime/core/migrate-v1'
import type { SanitizeChange } from '../../runtime/core/sanitize'
import type { PublicVisualEditorConfig } from '../../options'
import { createEditor, joinBase, provideEditor, type ComponentDefinition } from '../context'
import { DEFAULT_CATEGORIES, DEFAULT_COMPONENTS } from '../library/default-components'
import ComponentLibrary from './ComponentLibrary.vue'
import EditorCanvas from './EditorCanvas.vue'
import Inspector from './Inspector.vue'
import PreviewDialog from './PreviewDialog.vue'
import VeIcon from './ui/VeIcon.vue'

const props = defineProps<{
  /** Component library; defaults to the built-in components. */
  components?: ComponentDefinition[]
  /** Category order; defaults to the categories used by `components`. */
  categories?: string[]
}>()

const emit = defineEmits<{
  /** The sanitizer removed something from loaded or edited content. */
  sanitized: [changes: SanitizeChange[]]
  /** v1 content was converted when it was loaded. */
  migrate: [report: MigrationReport]
}>()

const model = defineModel<string>({ default: '' })

const runtimeConfig = useRuntimeConfig()
const config = runtimeConfig.public.visualEditor as PublicVisualEditorConfig
const editor = createEditor(
  config,
  joinBase((runtimeConfig.app as { baseURL: string }).baseURL, config.assetsBaseURL),
  {
    onModel: (html) => {
      model.value = html
    },
    onSanitized: (changes) => emit('sanitized', changes),
    onMigrate: (report) => emit('migrate', report),
  },
)
provideEditor(editor)

const library = computed(() => props.components ?? DEFAULT_COMPONENTS)
const categories = computed(() => {
  if (props.categories) return props.categories
  const used = [...new Set(library.value.map((c) => c.category))]
  return props.components ? used : DEFAULT_CATEGORIES.filter((c) => used.includes(c))
})

const libraryOpen = ref(true)
const inspectorOpen = ref(true)
const previewOpen = ref(false)
const root = ref<HTMLElement>()

// Content is DOM-parsed, so it is only loaded in the browser; SSR renders the empty shell.
onMounted(() => editor.load(model.value))
watch(model, (html) => {
  if (!editor.isCurrent(html)) editor.load(html)
})

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !root.value?.contains(next)) editor.flush()
}
onBeforeUnmount(() => editor.flush())

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && editor.selected.value && !previewOpen.value) editor.select(null)
}

function openPreview() {
  editor.flush()
  previewOpen.value = true
}

defineExpose({ flush: editor.flush })
</script>

<template>
  <div
    ref="root"
    class="ve-editor"
    :class="{ 've-editor--no-library': !libraryOpen, 've-editor--no-inspector': !inspectorOpen }"
    data-testid="visual-editor"
    @focusout="onFocusOut"
    @keydown="onKeydown"
  >
    <header class="ve-toolbar">
      <button
        type="button"
        class="ve-icon-button"
        :aria-pressed="libraryOpen"
        aria-label="Toggle component library"
        @click="libraryOpen = !libraryOpen"
      >
        <VeIcon name="layers" />
      </button>
      <span class="ve-toolbar__spacer" />
      <button type="button" class="ve-icon-button" aria-label="Preview" @click="openPreview">
        <VeIcon name="eye" />
      </button>
      <button
        type="button"
        class="ve-icon-button"
        :aria-pressed="inspectorOpen"
        aria-label="Toggle inspector"
        @click="inspectorOpen = !inspectorOpen"
      >
        <VeIcon name="squares" />
      </button>
    </header>
    <ComponentLibrary v-show="libraryOpen" :components="library" :categories="categories" />
    <EditorCanvas />
    <Inspector v-show="inspectorOpen" />
    <PreviewDialog v-model:open="previewOpen" />
  </div>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-editor {
  --ve-library-width: 15rem;
  --ve-inspector-width: 20rem;
  box-sizing: border-box;
  display: grid;
  grid-template:
    'toolbar toolbar toolbar' auto 'library canvas inspector' minmax(0, 1fr) / var(
      --ve-library-width
    )
    minmax(0, 1fr) var(--ve-inspector-width);
  height: 100%;
  min-height: 32rem;
  overflow: hidden;
  border: 1px solid var(--ve-border);
  border-radius: 0.75rem;
  background: var(--ve-surface);
  color: var(--ve-text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
  font-size: 0.875rem;
  line-height: 1.4;

  &--no-library {
    --ve-library-width: 0;
  }
  &--no-inspector {
    --ve-inspector-width: 0;
  }

  > :deep(.ve-library) {
    grid-area: library;
  }
  > :deep(.ve-canvas-scroll) {
    grid-area: canvas;
  }
  > :deep(.ve-inspector) {
    grid-area: inspector;
  }

  :deep(*) {
    box-sizing: border-box;
  }
}

.ve-toolbar {
  grid-area: toolbar;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border-bottom: 1px solid var(--ve-border);
}

.ve-toolbar__spacer {
  flex: 1;
}
.ve-icon-button {
  @include icon-button;
  &[aria-pressed='true'] {
    background: color-mix(in srgb, var(--ve-border) 70%, transparent);
  }
}

@media (max-width: 767px) {
  .ve-editor {
    grid-template:
      'toolbar' auto 'canvas' minmax(20rem, 1fr)
      'inspector' auto 'library' auto / minmax(0, 1fr);
  }
}
</style>
