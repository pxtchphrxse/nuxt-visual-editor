<template>
  <div class="bg-emerald-300">
    <div class="h-32" />
    <div class="w-4/5 h-96 mx-auto">
      <VisualEditor
        v-model="html"
        :components="components"
      />
      <client-only><pre class="overflow-x-auto">{{ html }}</pre></client-only>
    </div>
  </div>
</template>

<script setup>
import defaultComponents from '#visual-editor/utils/default-components'

const html = ref(`<section data-componentid="36c45f07-813d-4ad0-9a48-c90eaf46bf47"><div class="py-20 mx-auto max-w-7xl px-6"><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="mx-auto max-w-2xl lg:mx-0"><section><p class="text-base font-medium text-red-600">Get the help you need</p></section><h2 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Support center</h2><p class="mt-6 text-lg leading-8 text-gray-600">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.</p></div></div></div></section>`)
const components = ref(defaultComponents.filter(c => c.category !== 'teams'))
</script>
