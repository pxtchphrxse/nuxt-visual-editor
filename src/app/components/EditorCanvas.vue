<script setup lang="ts">
import { ref } from 'vue'
import { useEditor } from '../context'
import SectionToolbar from './SectionToolbar.vue'
import VeDialog from './ui/VeDialog.vue'

const editor = useEditor()
const pendingDelete = ref<string | null>(null)
let hovered: Element | null = null

function contentElement(target: EventTarget | null): HTMLElement | null {
  const el = target instanceof Element ? target : null
  const content = el?.closest('.ve-section__content')
  if (!el || !content || el === content) return null
  return el as HTMLElement
}

function onPointerOver(event: PointerEvent) {
  const el = contentElement(event.target)
  if (el === hovered) return
  hovered?.removeAttribute('data-ve-hovered')
  el?.setAttribute('data-ve-hovered', '')
  hovered = el
}

function onPointerLeave() {
  hovered?.removeAttribute('data-ve-hovered')
  hovered = null
}

function onClick(event: MouseEvent) {
  const el = contentElement(event.target)
  if (!el) return
  // Links and buttons inside content must not navigate while editing.
  event.preventDefault()
  editor.select(el)
}

function onDialogOpen(open: boolean) {
  if (!open) pendingDelete.value = null
}

function confirmDelete() {
  if (pendingDelete.value) editor.removeSection(pendingDelete.value)
  pendingDelete.value = null
}
</script>

<template>
  <div class="ve-canvas-scroll">
    <div
      :ref="
        (el) => {
          editor.canvas.value = el as HTMLElement | null
        }
      "
      class="ve-canvas"
      :class="editor.config.containerClass"
      data-testid="canvas"
      @pointerover="onPointerOver"
      @pointerleave="onPointerLeave"
      @click="onClick"
    >
      <div
        v-for="(section, index) in editor.sections.value"
        :key="`${section.id}:${section.epoch}`"
        class="ve-section"
        :data-section-index="index"
      >
        <SectionToolbar
          :index="index"
          :count="editor.sections.value.length"
          @up="editor.moveSection(section.id, -1)"
          @down="editor.moveSection(section.id, 1)"
          @remove="pendingDelete = section.id"
        />
        <div class="ve-section__content" v-html="section.html" />
      </div>
      <p v-if="!editor.sections.value.length" class="ve-canvas__empty">
        Add a component from the library to start.
      </p>
    </div>

    <div v-if="editor.lastDeleted.value" class="ve-undo" role="status">
      Section deleted.
      <button type="button" class="ve-undo__button" @click="editor.restoreSection()">Undo</button>
    </div>

    <VeDialog
      :open="pendingDelete !== null"
      title="Delete section?"
      description="The section is removed from the page. You can undo this right after."
      @update:open="onDialogOpen"
    >
      <template #footer>
        <button type="button" class="ve-button" @click="pendingDelete = null">Cancel</button>
        <button type="button" class="ve-button ve-button--danger" @click="confirmDelete">
          Delete
        </button>
      </template>
    </VeDialog>
  </div>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-canvas-scroll {
  position: relative;
  overflow-y: auto;
  background: color-mix(in srgb, var(--ve-border) 35%, var(--ve-surface));
}

.ve-canvas {
  min-height: 100%;
  margin: 0 auto;
  background: #fff;
  color: #111827;
}

.ve-section {
  position: relative;
}

// The toolbar root carries this component's scope id, so this plain scoped selector reaches it.
.ve-section:hover > .ve-section-toolbar {
  opacity: 1;
}

.ve-section__content {
  :deep([data-ve-hovered]) {
    outline: 2px dashed var(--ve-link);
    outline-offset: -2px;
    cursor: pointer;
  }

  :deep([data-ve-selected]) {
    outline: 2px solid var(--ve-brand);
    outline-offset: -2px;
  }
}

.ve-canvas__empty {
  margin: 0;
  padding: 4rem 1rem;
  color: var(--ve-muted);
  font-family: system-ui, sans-serif;
  text-align: center;
}

.ve-undo {
  position: sticky;
  bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: fit-content;
  margin: 1rem auto;
  padding: 0.5rem 0.75rem 0.5rem 1rem;
  border-radius: 9999px;
  background: var(--ve-text);
  color: var(--ve-surface);
  font-size: 0.875rem;
}

.ve-undo__button {
  @include reset-button;
  font-weight: 600;
  text-decoration: underline;
  &:focus-visible {
    @include focus-ring;
  }
}

.ve-button {
  @include button;
}
.ve-button--danger {
  @include button('danger');
}
</style>
