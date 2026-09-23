<script setup lang="ts">
// v1 content: migrated to the v2 vocabulary when loaded into the editor.
const html = ref(
  '<section data-componentid="36c45f07-813d-4ad0-9a48-c90eaf46bf47"><div class="py-20 mx-auto max-w-7xl px-6">' +
    '<p class="text-base font-medium text-red-600">Get the help you need</p>' +
    '<h2 class="text-4xl font-bold sm:text-6xl">Support center</h2></div></section>',
)
</script>

<template>
  <main style="max-width: 1200px; margin: 2rem auto; height: 80vh">
    <ClientOnly>
      <VisualEditor v-model="html" />
    </ClientOnly>
    <h3>Rendered with &lt;VisualEditorContent&gt;</h3>
    <VisualEditorContent :html="html" />
  </main>
</template>
