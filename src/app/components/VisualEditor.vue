<script setup lang="ts">
// Phase 3 skeleton: renders the model inside the content container. The full editor lands in phase 4.
import { useRuntimeConfig } from '#imports'
import type { PublicVisualEditorConfig } from '../../options'

const model = defineModel<string>({ default: '' })
const config = useRuntimeConfig().public.visualEditor as PublicVisualEditorConfig
</script>

<template>
  <div class="ve-editor">
    <div :class="config.containerClass" v-html="model" />
  </div>
</template>

<style lang="scss" scoped>
.ve-editor {
  font-family: system-ui, sans-serif;
  color: var(--ve-text);
  background: var(--ve-surface);
}
</style>
