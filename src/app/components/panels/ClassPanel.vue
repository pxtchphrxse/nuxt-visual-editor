<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { addClass, customClasses, removeClass } from '#visual-editor/core/document'
import { useEditor } from '../../context'
import VeIcon from '../ui/VeIcon.vue'
import VePanel from '../ui/VePanel.vue'

const editor = useEditor()
const name = ref('')
const error = ref('')
const id = useId()

const classes = computed(() => {
  void editor.revision.value
  return editor.selected.value ? customClasses(editor.selected.value) : []
})

const MESSAGES = {
  invalid: 'Class names must be valid CSS identifiers (letters, digits, - and _).',
  reserved: 'That class is managed by the editor controls.',
  exists: 'The element already has that class.',
} as const

function add() {
  const el = editor.selected.value
  if (!el || !name.value.trim()) return
  let result: ReturnType<typeof addClass> = 'ok'
  editor.mutate(() => {
    result = addClass(el, name.value)
  })
  error.value = result === 'ok' ? '' : MESSAGES[result]
  if (result === 'ok') name.value = ''
}

function remove(cls: string) {
  const el = editor.selected.value
  if (el) editor.mutate(() => removeClass(el, cls))
}
</script>

<template>
  <VePanel title="Custom classes" data-panel="classes">
    <ul v-if="classes.length" class="ve-chips">
      <li v-for="cls in classes" :key="cls">
        <button
          type="button"
          class="ve-chip"
          :aria-label="`Remove class ${cls}`"
          @click="remove(cls)"
        >
          {{ cls }} <VeIcon name="x-mark" />
        </button>
      </li>
    </ul>
    <div>
      <label :for="id" class="ve-label">Add class</label>
      <input
        :id="id"
        v-model="name"
        type="text"
        autocomplete="off"
        spellcheck="false"
        class="ve-input"
        :aria-invalid="!!error"
        @keydown.enter.prevent="add"
      />
      <p v-if="error" class="ve-error" role="alert">{{ error }}</p>
    </div>
  </VePanel>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ve-chip {
  @include button;
  padding: 0.25rem 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  :deep(.ve-icon) {
    width: 0.875rem;
    height: 0.875rem;
  }
}

.ve-label {
  @include label;
}
.ve-input {
  @include field;
  font-family: ui-monospace, monospace;
}
.ve-error {
  margin: 0.25rem 0 0;
  color: var(--ve-error);
  font-size: 0.75rem;
}
</style>
