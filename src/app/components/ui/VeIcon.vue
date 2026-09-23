<script setup lang="ts">
import { ICONS, type IconName } from '../../icons'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg
    class="ve-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <path v-for="d in ICONS[name]" :key="d" stroke-linecap="round" stroke-linejoin="round" :d="d" />
  </svg>
</template>

<style lang="scss" scoped>
.ve-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
</style>
