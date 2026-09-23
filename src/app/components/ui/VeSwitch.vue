<script setup lang="ts">
import { useId } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'

defineProps<{ label: string }>()
const checked = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <div class="ve-switch">
    <label :for="id">{{ label }}</label>
    <SwitchRoot :id="id" v-model="checked" class="ve-switch__root">
      <SwitchThumb class="ve-switch__thumb" />
    </SwitchRoot>
  </div>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $gap;
  font-size: 0.875rem;
}

.ve-switch__root {
  @include reset-button;
  position: relative;
  width: 2.5rem;
  height: 1.375rem;
  border-radius: 9999px;
  background: var(--ve-border);
  transition: background-color 120ms ease;
  &[data-state='checked'] {
    background: var(--ve-link);
  }
  &:focus-visible {
    @include focus-ring;
  }
}

.ve-switch__thumb {
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 25%);
  transform: translateX(2px);
  transition: transform 120ms ease;
  &[data-state='checked'] {
    transform: translateX(1.25rem);
  }
}
</style>
