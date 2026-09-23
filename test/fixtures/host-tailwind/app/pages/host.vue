<template>
  <main>
    <p id="tw" class="p-4 text-red-600 font-bold">Host Tailwind paragraph</p>
    <VisualEditorContent
      id="rendered"
      :html="'<section data-ve-id=&quot;h1&quot; data-ve-v=&quot;2&quot; class=&quot;pad&quot; style=&quot;--pad-y: 3rem;&quot;><p>Saved content</p></section>'"
    />
  </main>
</template>
