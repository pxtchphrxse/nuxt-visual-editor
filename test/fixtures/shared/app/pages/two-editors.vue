<script setup lang="ts">
const a = ref('')
const b = ref('')
if (import.meta.client) Object.assign(window, { __two: { a, b } })
</script>

<template>
  <main style="display: grid; gap: 1rem; padding: 1rem">
    <div style="height: 40rem"><VisualEditor v-model="a" data-editor="a" /></div>
    <div style="height: 40rem"><VisualEditor v-model="b" data-editor="b" /></div>
  </main>
</template>
