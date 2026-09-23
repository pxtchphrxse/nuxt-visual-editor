<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import VeIcon from './VeIcon.vue'

withDefaults(defineProps<{ title: string; defaultOpen?: boolean }>(), { defaultOpen: false })
</script>

<template>
  <CollapsibleRoot class="ve-panel" :default-open="defaultOpen">
    <CollapsibleTrigger class="ve-panel__trigger">
      <span>{{ title }}</span>
      <VeIcon name="chevron-right" class="ve-panel__chevron" />
    </CollapsibleTrigger>
    <CollapsibleContent class="ve-panel__content">
      <slot />
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-panel {
  border-top: 1px solid var(--ve-border);
}

.ve-panel__trigger {
  @include reset-button;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  &:hover {
    background: color-mix(in srgb, var(--ve-border) 40%, transparent);
  }
  &:focus-visible {
    @include focus-ring;
    outline-offset: -2px;
  }
  &[data-state='open'] .ve-panel__chevron {
    transform: rotate(90deg);
  }
}

.ve-panel__chevron {
  transition: transform 120ms ease;
}

.ve-panel__content {
  display: grid;
  gap: 0.875rem;
  padding: 0.25rem 1rem 1rem;
}
</style>
