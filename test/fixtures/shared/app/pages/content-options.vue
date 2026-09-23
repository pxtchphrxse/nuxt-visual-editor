<script setup lang="ts">
// `data-raw` is not in the content policy: it survives only when the HTML is marked trusted.
const html =
  '<section data-ve-id="t" data-ve-v="2"><p data-raw="1" class="pad" style="--pad-y: 1rem;">Content</p></section>'
</script>

<template>
  <main>
    <VisualEditorContent id="trusted" :html="html" trusted tag="article" />
    <VisualEditorContent id="untrusted" :html="html" />
    <VisualEditorContent id="bad-tag" :html="html" :tag="'script' as never" />
  </main>
</template>
