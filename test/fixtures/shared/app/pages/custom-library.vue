<script setup lang="ts">
// A consumer-provided library (no previews) whose categories change at runtime.
const html = ref('')
const components = [
  { name: 'Plain block', category: 'custom', html: '<section><p>Custom block</p></section>' },
  { name: 'Other block', category: 'other', html: '<section><h2>Other block</h2></section>' },
]
const categories = ref<string[]>()
</script>

<template>
  <main style="height: 90vh; padding: 1rem">
    <button id="only-other" type="button" @click="categories = ['other']">Only other</button>
    <button id="no-categories" type="button" @click="categories = []">No categories</button>
    <VisualEditor v-model="html" :components="components" :categories="categories" />
  </main>
</template>
