<script setup lang="ts">
import { computed } from 'vue'
import { toOptions } from '../../composables'
import { useEditor } from '../../context'
import VarSelect from '../ui/VarSelect.vue'
import VePanel from '../ui/VePanel.vue'

const editor = useEditor()
const spacing = computed(() => toOptions(editor.config.tokens.spacing))
const margin = computed(() => [...spacing.value, { label: 'auto', value: 'auto' }])
</script>

<template>
  <VePanel title="Padding & margin" data-panel="spacing">
    <VarSelect label="Padding (vertical)" name="--pad-y" :options="spacing" />
    <VarSelect label="Padding (horizontal)" name="--pad-x" :options="spacing" />
    <VarSelect label="Margin (vertical)" name="--mar-y" :options="margin" />
    <VarSelect label="Margin (horizontal)" name="--mar-x" :options="margin" />
  </VePanel>
</template>
