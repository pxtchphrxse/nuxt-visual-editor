<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import type { StyleVar } from '../../../runtime/core/schema'
import { isValidVarValue } from '#visual-editor/core/schema'
import { useVarModel } from '../../composables'
import { useEditor } from '../../context'
import VeIcon from './VeIcon.vue'

const props = defineProps<{ el: HTMLElement; label: string; name: StyleVar }>()
const editor = useEditor()
const model = useVarModel(props.el, props.name)
const hex = ref('')
const invalid = ref(false)
const id = useId()

watch(
  model,
  (value) => {
    hex.value = value
    invalid.value = false
  },
  { immediate: true },
)

function applyHex() {
  const value = hex.value.trim()
  if (value && !isValidVarValue(props.name, value)) {
    invalid.value = true
    return
  }
  invalid.value = false
  model.value = value
}
</script>

<template>
  <fieldset class="ve-color" :data-var="name">
    <legend>{{ label }}</legend>
    <div class="ve-color__swatches" role="group" :aria-label="`${label} palette`">
      <button
        v-for="color in editor.config.tokens.palette"
        :key="color"
        type="button"
        class="ve-color__swatch"
        :style="{ background: color }"
        :aria-label="color"
        :aria-pressed="model === color"
        @click="model = color"
      >
        <VeIcon v-if="model === color" name="check" />
      </button>
      <button
        type="button"
        class="ve-color__swatch ve-color__swatch--none"
        aria-label="No colour"
        :aria-pressed="!model"
        @click="model = ''"
      >
        <VeIcon name="x-mark" />
      </button>
    </div>
    <div class="ve-color__custom">
      <label :for="id">Hex</label>
      <input
        :id="id"
        v-model="hex"
        type="text"
        placeholder="#10b981"
        autocomplete="off"
        spellcheck="false"
        :aria-invalid="invalid"
        :aria-describedby="invalid ? `${id}-error` : undefined"
        @keydown.enter.prevent="applyHex"
        @blur="applyHex"
      />
    </div>
    <p v-if="invalid" :id="`${id}-error`" class="ve-color__error" role="alert">
      Use a hex colour such as #10b981.
    </p>
  </fieldset>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-color {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

legend {
  @include label;
}

.ve-color__swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(1.5rem, 1fr));
  gap: 0.25rem;
}

.ve-color__swatch {
  @include reset-button;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px solid var(--ve-border);
  border-radius: 0.25rem;
  color: #fff;
  mix-blend-mode: normal;
  :deep(.ve-icon) {
    width: 0.875rem;
    height: 0.875rem;
    filter: drop-shadow(0 0 1px #000);
  }
  &:focus-visible {
    @include focus-ring;
  }
  &--none {
    background: var(--ve-surface);
    color: var(--ve-error);
    :deep(.ve-icon) {
      filter: none;
    }
  }
}

.ve-color__custom {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: $gap;
  margin-top: 0.5rem;
  label {
    color: var(--ve-muted);
    font-size: 0.75rem;
  }
  input {
    @include field;
    font-family: ui-monospace, monospace;
  }
}

.ve-color__error {
  margin: 0.25rem 0 0;
  color: var(--ve-error);
  font-size: 0.75rem;
}
</style>
