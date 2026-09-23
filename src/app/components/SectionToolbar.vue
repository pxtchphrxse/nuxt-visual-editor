<script setup lang="ts">
import VeIcon from './ui/VeIcon.vue'

defineProps<{ index: number; count: number }>()
defineEmits<{ up: []; down: []; remove: [] }>()
</script>

<template>
  <div class="ve-section-toolbar" role="toolbar" :aria-label="`Section ${index + 1} actions`">
    <button
      type="button"
      :aria-label="`Move section ${index + 1} up`"
      :disabled="index === 0"
      @click="$emit('up')"
    >
      <VeIcon name="arrow-up" />
    </button>
    <button
      type="button"
      :aria-label="`Move section ${index + 1} down`"
      :disabled="index === count - 1"
      @click="$emit('down')"
    >
      <VeIcon name="arrow-down" />
    </button>
    <button
      type="button"
      class="ve-danger"
      :aria-label="`Delete section ${index + 1}`"
      @click="$emit('remove')"
    >
      <VeIcon name="trash" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-section-toolbar {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 5;
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--ve-border);
  border-radius: 9999px;
  background: var(--ve-surface);
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  opacity: 0;
  transition: opacity 120ms ease;

  button {
    @include icon-button;
  }
  .ve-danger:hover {
    background: var(--ve-error);
    color: #fff;
  }
}

// Visible while a toolbar button has focus (keyboard users); hover is handled by the canvas.
.ve-section-toolbar:focus-within {
  opacity: 1;
}
</style>
