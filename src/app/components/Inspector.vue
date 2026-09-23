<script setup lang="ts">
import { computed } from 'vue'
import { canHaveLink, getLink, isImage, isTextElement } from '#visual-editor/core/document'
import { useEditor } from '../context'
import BorderPanel from './panels/BorderPanel.vue'
import ClassPanel from './panels/ClassPanel.vue'
import ColorPanel from './panels/ColorPanel.vue'
import ImagePanel from './panels/ImagePanel.vue'
import LinkPanel from './panels/LinkPanel.vue'
import SpacingPanel from './panels/SpacingPanel.vue'
import TextPanel from './panels/TextPanel.vue'
import TypographyPanel from './panels/TypographyPanel.vue'
import VeIcon from './ui/VeIcon.vue'

const editor = useEditor()

const info = computed(() => {
  void editor.revision.value
  const el = editor.selected.value
  if (!el) return null
  const parent = el.parentElement?.closest('section[data-ve-id]') ? el.parentElement : null
  return {
    tag: el.tagName.toLowerCase(),
    image: isImage(el),
    text: isTextElement(el),
    link: canHaveLink(el) || !!getLink(el),
    parent: el.tagName === 'SECTION' ? null : parent,
  }
})
</script>

<template>
  <aside class="ve-inspector" aria-label="Inspector" data-testid="inspector">
    <template v-if="info">
      <header class="ve-inspector__header">
        <p class="ve-inspector__title">
          Editing <code>&lt;{{ info.tag }}&gt;</code>
        </p>
        <div class="ve-inspector__actions">
          <button
            v-if="info.parent"
            type="button"
            class="ve-icon-button"
            aria-label="Select parent element"
            title="Select parent element"
            @click="editor.select(info.parent)"
          >
            <VeIcon name="arrow-up" />
          </button>
          <button
            type="button"
            class="ve-icon-button"
            aria-label="Deselect"
            title="Deselect"
            @click="editor.select(null)"
          >
            <VeIcon name="bolt-slash" />
          </button>
        </div>
      </header>
      <div class="ve-inspector__panels">
        <ImagePanel v-if="info.image" />
        <TextPanel v-if="info.text" />
        <LinkPanel v-if="info.link" />
        <TypographyPanel />
        <ColorPanel />
        <SpacingPanel />
        <BorderPanel />
        <ClassPanel />
      </div>
    </template>
    <p v-else class="ve-inspector__empty">Select an element in the canvas to edit it.</p>
  </aside>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-inspector {
  overflow-y: auto;
  border-left: 1px solid var(--ve-border);
  background: var(--ve-surface);
}

.ve-inspector__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $gap;
  padding: 0.75rem 1rem;
  background: var(--ve-surface);
}

.ve-inspector__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  code {
    font-family: ui-monospace, monospace;
  }
}

.ve-inspector__actions {
  display: flex;
  gap: 0.25rem;
}
.ve-icon-button {
  @include icon-button;
}

.ve-inspector__empty {
  margin: 0;
  padding: 1.5rem 1rem;
  color: var(--ve-muted);
  font-size: 0.875rem;
}
</style>
