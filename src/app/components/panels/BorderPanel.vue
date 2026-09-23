<script setup lang="ts">
import { toOptions } from '../../composables'
import ColorField from '../ui/ColorField.vue'
import VarSelect from '../ui/VarSelect.vue'
import VePanel from '../ui/VePanel.vue'

defineProps<{ el: HTMLElement }>()

const styles = toOptions(['solid', 'dashed', 'dotted', 'double', 'none'])
const widths = toOptions(['1px', '2px', '4px', '8px'])
const radii = [
  ['none', '0'],
  ['sm', '0.125rem'],
  ['base', '0.25rem'],
  ['md', '0.375rem'],
  ['lg', '0.5rem'],
  ['xl', '0.75rem'],
  ['2xl', '1rem'],
  ['3xl', '1.5rem'],
  ['full', '9999px'],
].map(([label, value]) => ({ label: `${label} (${value})`, value: value! }))
</script>

<template>
  <VePanel title="Border & radius" data-panel="border">
    <VarSelect :el="el" label="Border style" name="--bd-s" :options="styles" />
    <VarSelect :el="el" label="Border width" name="--bd-w" :options="widths" />
    <ColorField :el="el" label="Border colour" name="--bd-c" />
    <VarSelect :el="el" label="Radius (all corners)" name="--r" :options="radii" />
    <VarSelect :el="el" label="Radius top left" name="--r-tl" :options="radii" />
    <VarSelect :el="el" label="Radius top right" name="--r-tr" :options="radii" />
    <VarSelect :el="el" label="Radius bottom right" name="--r-br" :options="radii" />
    <VarSelect :el="el" label="Radius bottom left" name="--r-bl" :options="radii" />
  </VePanel>
</template>
