<script setup lang="ts">
import { computed } from 'vue'
import { useEditor } from '../context'
import VeDialog from './ui/VeDialog.vue'

const open = defineModel<boolean>('open', { default: false })
const editor = useEditor()
const html = computed(() => (open.value ? editor.previewHtml() : ''))
</script>

<template>
  <VeDialog v-model:open="open" title="Preview" size="full">
    <div
      :class="editor.config.containerClass"
      class="ve-preview"
      data-testid="preview"
      v-html="html"
    />
  </VeDialog>
</template>

<style lang="scss" scoped>
.ve-preview {
  background: #fff;
  color: #111827;
}
</style>
