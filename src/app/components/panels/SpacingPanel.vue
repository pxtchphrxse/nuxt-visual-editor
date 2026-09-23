<script setup lang="ts">
import { computed } from 'vue'
import { toOptions } from '../../composables'
import { useEditor } from '../../context'
import VarSelect from '../ui/VarSelect.vue'
import VePanel from '../ui/VePanel.vue'

defineProps<{ el: HTMLElement }>()

const editor = useEditor()
const spacing = computed(() => toOptions(editor.config.tokens.spacing))
const margin = computed(() => [...spacing.value, { label: 'auto', value: 'auto' }])
</script>

<template>
  <VePanel title="Padding & margin" data-panel="spacing">
    <VarSelect :el="el" label="Padding (vertical)" name="--pad-y" :options="spacing" />
    <VarSelect :el="el" label="Padding (horizontal)" name="--pad-x" :options="spacing" />
    <VarSelect :el="el" label="Margin (vertical)" name="--mar-y" :options="margin" />
    <VarSelect :el="el" label="Margin (horizontal)" name="--mar-x" :options="margin" />
  </VePanel>
</template>
