<script setup lang="ts">
import { onMounted, useId, watch } from 'vue'
import { useInitDesigner } from '../composables/useDesigner'
import type { VisualEditorProps } from '../utils/designer'
import SidebarLeft from './designer/editor-menu/SidebarLeft.vue'
import MainEditor from './designer/editor-menu/MainEditor.vue'
import SidebarRight from './designer/editor-menu/SidebarRight.vue'
import DesignerPreviewModal from './modal/DesignerPreviewModal.vue'
import Preview from './designer/Preview.vue'
import { provideHeadlessUseId } from '#imports'

// Use SSR-safe IDs for Headless UI
provideHeadlessUseId(() => useId())

const designerId = useId()
const props = defineProps<VisualEditorProps>()
const { state, designer } = useInitDesigner(designerId!, props.components, props.categories)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// parse once on mounted only in case of when modelValue updated a DOM reference also updated which will discontinuity in editor-menu
onMounted(() => {
  if (props.modelValue) {
    designer.parseComponents(props.modelValue)
    designer.saveCurrentDesignWithTimer()
    designer.addClickAndHoverEvents()
  }
})
watch(() => state.preview, (value) => {
  emit('update:modelValue', value)
})
</script>

<template>
  <div class="visual-editor h-full">
    <DesignerPreviewModal
      :show="state.showPreview"
      @first-designer-preview-modal-button-function="state.showPreview = false"
    >
      <Preview />
    </DesignerPreviewModal>
    <div
      class="w-full inset-x-0 h-full lg:pt-0 pt-0-z-10 bg-white overflow-x-scroll"
    >
      <div class="relative h-full flex">
        <SidebarLeft />
        <MainEditor />
        <SidebarRight />
      </div>
    </div>
  </div>
</template>

<style>
.pagebuilder a {
  cursor: default;
}
.pagebuilder [selected] {
  outline: rgb(185, 16, 16) dashed 4px !important;
  outline-offset: -2px !important;
}
.pagebuilder [hovered] {
  outline: rgb(0, 140, 14, 1) dashed 4px !important;
  outline-offset: -2px !important;
}

.sortable-ghost {
  display: flex;
  justify-content: center;
}

.sortable-ghost > * {
  width: 100%;
}
</style>
