<script setup lang="ts">
import ColorField from '../ui/ColorField.vue'
import VarSelect from '../ui/VarSelect.vue'
import VePanel from '../ui/VePanel.vue'

const alphas = [0, 0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 0.95, 1].map(
  (a) => ({ label: `${Math.round(a * 100)}%`, value: String(a) }),
)
</script>

<template>
  <VePanel title="Colour & opacity" data-panel="color">
    <ColorField label="Background" name="--bg" />
    <VarSelect label="Background opacity" name="--bg-a" :options="alphas" />
    <ColorField label="Text colour" name="--fg" />
    <VarSelect label="Element opacity" name="--op" :options="alphas" />
  </VePanel>
</template>
