<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import VeIcon from './VeIcon.vue'

withDefaults(defineProps<{ title: string; description?: string; size?: 'sm' | 'full' }>(), {
  size: 'sm',
  description: undefined,
})
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="ve-portal ve-dialog__overlay" />
      <DialogContent class="ve-portal ve-dialog" :class="`ve-dialog--${size}`">
        <header class="ve-dialog__header">
          <DialogTitle class="ve-dialog__title">{{ title }}</DialogTitle>
          <DialogClose class="ve-dialog__close" aria-label="Close">
            <VeIcon name="x-mark" />
          </DialogClose>
        </header>
        <DialogDescription v-if="description" class="ve-dialog__description">{{
          description
        }}</DialogDescription>
        <div class="ve-dialog__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="ve-dialog__footer">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgb(15 23 42 / 55%);
}

.ve-dialog {
  position: fixed;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: var(--ve-surface);
  color: var(--ve-text);
  font-family: system-ui, sans-serif;
  box-shadow: 0 20px 50px rgb(0 0 0 / 30%);

  &--sm {
    top: 50%;
    left: 50%;
    width: min(28rem, calc(100vw - 2rem));
    padding: 1.25rem;
    border-radius: 0.75rem;
    transform: translate(-50%, -50%);
  }

  &--full {
    inset: 0;
  }
}

.ve-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  .ve-dialog--full & {
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--ve-border);
  }
}

.ve-dialog__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.ve-dialog__close {
  @include icon-button;
}

.ve-dialog__description {
  margin: 0.5rem 0 0;
  color: var(--ve-muted);
  font-size: 0.875rem;
}

.ve-dialog__body {
  .ve-dialog--full & {
    flex: 1;
    overflow: auto;
  }
}

.ve-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: $gap;
  margin-top: 1.25rem;
}
</style>
