<script setup lang="ts">
import { computed } from 'vue'
import { toOptions } from '../../composables'
import { useEditor } from '../../context'
import VarSelect from '../ui/VarSelect.vue'
import VePanel from '../ui/VePanel.vue'

defineProps<{ el: HTMLElement }>()

const editor = useEditor()
const sizes = computed(() =>
  Object.entries(editor.config.tokens.fontSizes).map(([label, value]) => ({
    label: `${label} (${value})`,
    value,
  })),
)
const weights = [
  ['Thin', '100'],
  ['Extra light', '200'],
  ['Light', '300'],
  ['Normal', '400'],
  ['Medium', '500'],
  ['Semibold', '600'],
  ['Bold', '700'],
  ['Extra bold', '800'],
  ['Black', '900'],
].map(([label, value]) => ({ label: `${label} (${value})`, value: value! }))
const families = computed(() =>
  editor.config.tokens.fonts.map((name) => ({ label: name, value: `var(--ve-font-${name})` })),
)
</script>

<template>
  <VePanel title="Typography" data-panel="typography">
    <VarSelect :el="el" label="Font size" name="--fs" :options="sizes" />
    <VarSelect :el="el" label="Font size ≥ 640px" name="--fs-sm" :options="sizes" />
    <VarSelect :el="el" label="Font size ≥ 768px" name="--fs-md" :options="sizes" />
    <VarSelect :el="el" label="Font size ≥ 1024px" name="--fs-lg" :options="sizes" />
    <VarSelect :el="el" label="Weight" name="--fw" :options="weights" />
    <VarSelect :el="el" label="Family" name="--ff" :options="families" />
    <VarSelect :el="el" label="Style" name="--fst" :options="toOptions(['normal', 'italic'])" />
    <VarSelect
      :el="el"
      label="Alignment"
      name="--ta"
      :options="toOptions(['left', 'center', 'right', 'justify'])"
    />
    <VarSelect
      :el="el"
      label="Line height"
      name="--lh"
      :options="toOptions(['1', '1.25', '1.5', '1.75', '2'])"
    />
  </VePanel>
</template>
