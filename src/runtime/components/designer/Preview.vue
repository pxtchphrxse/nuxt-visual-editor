<template>
  <div
    class="w-full inset-x-0 h-[94vh] lg:pt-0 pt-0 z-50 overflow-x-scroll bg-white"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="state.preview" />
  </div>
</template>

<script setup>
import { useDesigner } from '../../composables/useDesigner'

const { state } = useDesigner()
</script>
