<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { getLink, removeLink, setLink } from '#visual-editor/core/document'
import { useEditor } from '../../context'
import VePanel from '../ui/VePanel.vue'
import VeSwitch from '../ui/VeSwitch.vue'

const editor = useEditor()
const enabled = ref(false)
const href = ref('')
const newTab = ref(false)
const error = ref('')
const id = useId()

watch(
  editor.selected,
  (el) => {
    const link = el ? getLink(el) : null
    enabled.value = !!link
    href.value = link?.href ?? ''
    newTab.value = link?.newTab ?? false
    error.value = ''
  },
  { immediate: true },
)

function apply() {
  const el = editor.selected.value
  if (!el) return
  let ok = false
  editor.mutate(() => {
    ok = setLink(el, { href: href.value, newTab: newTab.value })
  })
  error.value = ok ? '' : 'Use an http(s), mailto: or tel: link, or a relative path.'
}

watch(enabled, (on) => {
  const el = editor.selected.value
  if (!on && el && getLink(el)) editor.mutate(() => removeLink(el))
})
watch(newTab, () => {
  if (enabled.value && href.value && editor.selected.value && getLink(editor.selected.value))
    apply()
})
</script>

<template>
  <VePanel title="Link" data-panel="link">
    <VeSwitch v-model="enabled" label="Link this text" />
    <template v-if="enabled">
      <div>
        <label :for="id" class="ve-label">URL</label>
        <input
          :id="id"
          v-model="href"
          type="url"
          inputmode="url"
          placeholder="https://example.com"
          autocomplete="off"
          class="ve-input"
          :aria-invalid="!!error"
          :aria-describedby="error ? `${id}-error` : undefined"
          @keydown.enter.prevent="apply"
        />
        <p v-if="error" :id="`${id}-error`" class="ve-error" role="alert">{{ error }}</p>
      </div>
      <VeSwitch v-model="newTab" label="Open in new tab" />
      <button type="button" class="ve-button" @click="apply">Apply link</button>
    </template>
  </VePanel>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-label {
  @include label;
}
.ve-input {
  @include field;
}
.ve-button {
  @include button('primary');
}
.ve-error {
  margin: 0.25rem 0 0;
  color: var(--ve-error);
  font-size: 0.75rem;
}
</style>
