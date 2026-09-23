<script setup lang="ts">
import { toOptions } from '../../composables'
import ColorField from '../ui/ColorField.vue'
import VarSelect from '../ui/VarSelect.vue'
import VePanel from '../ui/VePanel.vue'

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
    <VarSelect label="Border style" name="--bd-s" :options="styles" />
    <VarSelect label="Border width" name="--bd-w" :options="widths" />
    <ColorField label="Border colour" name="--bd-c" />
    <VarSelect label="Radius (all corners)" name="--r" :options="radii" />
    <VarSelect label="Radius top left" name="--r-tl" :options="radii" />
    <VarSelect label="Radius top right" name="--r-tr" :options="radii" />
    <VarSelect label="Radius bottom right" name="--r-br" :options="radii" />
    <VarSelect label="Radius bottom left" name="--r-bl" :options="radii" />
  </VePanel>
</template>
