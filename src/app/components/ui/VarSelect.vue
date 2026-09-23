<script setup lang="ts">
import { useId } from 'vue'
import type { StyleVar } from '../../../runtime/core/schema'
import { useVarModel, type Option } from '../../composables'

const props = defineProps<{ label: string; name: StyleVar; options: Option[] }>()
const model = useVarModel(props.name)
const id = useId()
</script>

<template>
  <div class="ve-field">
    <label :for="id">{{ label }}</label>
    <select :id="id" v-model="model" :data-var="name">
      <option value="">Default</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      <option v-if="model && !options.some((o) => o.value === model)" :value="model">
        {{ model }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

label {
  @include label;
}
select {
  @include field;
}
</style>
