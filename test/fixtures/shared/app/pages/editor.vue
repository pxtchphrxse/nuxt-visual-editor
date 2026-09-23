<script setup lang="ts">
// Exposes the model and emitted events on window for e2e assertions.
const route = useRoute()
const html = ref(typeof route.query.html === 'string' ? route.query.html : '')
const sanitized = ref<unknown[]>([])
const migrated = ref<unknown[]>([])
if (import.meta.client) {
  Object.assign(window, { __ve: { html, sanitized, migrated } })
}
</script>

<template>
  <main style="height: 90vh; padding: 1rem">
    <VisualEditor
      v-model="html"
      @sanitized="(c) => sanitized.push(c)"
      @migrate="(r) => migrated.push(r)"
    />
    <pre data-testid="model">{{ html }}</pre>
  </main>
</template>
