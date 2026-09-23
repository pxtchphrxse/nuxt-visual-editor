<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { getText, setText } from '#visual-editor/core/document'
import { useEditor } from '../../context'
import VePanel from '../ui/VePanel.vue'

const props = defineProps<{ el: HTMLElement }>()
const editor = useEditor()
const text = ref(getText(props.el))
const textarea = ref<HTMLTextAreaElement>()
const id = useId()

// Pick up changes made elsewhere (e.g. sanitization), but never overwrite what is being typed.
watch(editor.revision, () => {
  if (document.activeElement !== textarea.value) text.value = getText(props.el)
})

function onInput() {
  editor.mutate(() => setText(props.el, text.value))
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
