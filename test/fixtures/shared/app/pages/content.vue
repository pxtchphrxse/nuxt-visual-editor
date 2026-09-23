<script setup lang="ts">
const html =
  '<section data-ve-id="s1" data-ve-v="2" class="pad bg" style="--pad-y: 2rem; --bg: #10b981;">' +
  '<h2 class="fs" style="--fs: 2rem;">Hello</h2>' +
  '<img src="x" onerror="window.__pwned = true">' +
  '<a href="javascript:window.__pwned = true">bad link</a></section>'
</script>

<template>
  <main>
    <p class="host-paragraph">Host paragraph</p>
    <VisualEditorContent id="rendered" :html="html" />
  </main>
</template>
