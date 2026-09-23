<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { getText, setText } from '#visual-editor/core/document'
import { useEditor } from '../../context'
import VePanel from '../ui/VePanel.vue'

const editor = useEditor()
const text = ref('')
const textarea = ref<HTMLTextAreaElement>()
const id = useId()

watch(
  [editor.selected, editor.revision],
  () => {
    // Do not overwrite what the user is typing.
    if (editor.selected.value && document.activeElement !== textarea.value)
      text.value = getText(editor.selected.value)
  },
  { immediate: true },
)

function onInput() {
  const el = editor.selected.value
  if (el) editor.mutate(() => setText(el, text.value))
}
</script>

<template>
  <VePanel title="Text" default-open data-panel="text">
    <label :for="id" class="ve-label">Content</label>
    <textarea
      :id="id"
      ref="textarea"
      v-model="text"
      rows="6"
      class="ve-textarea"
      @input="onInput"
    />
  </VePanel>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-label {
  @include label;
}
.ve-textarea {
  @include field;
  resize: vertical;
  line-height: 1.4;
}
</style>
