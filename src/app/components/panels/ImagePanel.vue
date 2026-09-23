<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { IMAGE_MIME_TYPES, readImageFile, setImageSrc } from '#visual-editor/core/document'
import { useEditor } from '../../context'
import VeIcon from '../ui/VeIcon.vue'
import VePanel from '../ui/VePanel.vue'

const props = defineProps<{ el: HTMLImageElement }>()
const editor = useEditor()
const src = ref('')
const alt = ref('')
const url = ref('')
const error = ref('')
const dragging = ref(false)
const input = ref<HTMLInputElement>()
const id = useId()

watch(
  editor.revision,
  () => {
    src.value = props.el.getAttribute('src') ?? ''
    alt.value = props.el.getAttribute('alt') ?? ''
  },
  { immediate: true },
)

function setSource(value: string) {
  let ok = false
  editor.mutate(() => {
    ok = setImageSrc(props.el, value)
  })
  error.value = ok
    ? ''
    : 'Use an https:// image URL, a relative path, or upload a PNG, JPEG, GIF or WebP.'
}

async function useFile(file: File | undefined) {
  if (!file) return
  try {
    setSource(await readImageFile(file))
  } catch {
    error.value = 'Only PNG, JPEG, GIF and WebP images can be uploaded.'
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false
  void useFile(event.dataTransfer?.files[0])
}

function onAlt() {
  editor.mutate(() =>
    alt.value ? props.el.setAttribute('alt', alt.value) : props.el.removeAttribute('alt'),
  )
}
</script>

<template>
  <VePanel title="Image" default-open data-panel="image">
    <div
      class="ve-drop"
      :class="{ 've-drop--active': dragging }"
      data-testid="image-drop"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <img v-if="src" :src="src" alt="" class="ve-drop__preview" />
      <button type="button" class="ve-button" @click="input?.click()">
        <VeIcon name="photo" /> Replace image
      </button>
      <p class="ve-hint"><VeIcon name="cloud-arrow-up" /> or drop an image here</p>
      <input
        ref="input"
        type="file"
        :accept="IMAGE_MIME_TYPES.join(',')"
        hidden
        data-testid="image-file"
        @change="useFile(($event.target as HTMLInputElement).files?.[0])"
      />
    </div>
    <div>
      <label :for="`${id}-url`" class="ve-label">Image URL</label>
      <input
        :id="`${id}-url`"
        v-model="url"
        type="url"
        placeholder="https://"
        class="ve-input"
        @keydown.enter.prevent="setSource(url)"
      />
    </div>
    <div>
      <label :for="`${id}-alt`" class="ve-label">Alt text</label>
      <input :id="`${id}-alt`" v-model="alt" type="text" class="ve-input" @change="onAlt" />
    </div>
    <p v-if="error" class="ve-error" role="alert">{{ error }}</p>
  </VePanel>
</template>

<style lang="scss" scoped>
@use 'editor/mixins' as *;

.ve-drop {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px dashed var(--ve-border);
  border-radius: $radius;
  &--active {
    border-color: var(--ve-link);
    background: color-mix(in srgb, var(--ve-link) 8%, transparent);
  }
}

.ve-drop__preview {
  width: 100%;
  max-height: 10rem;
  object-fit: contain;
  border-radius: 0.25rem;
}

.ve-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  color: var(--ve-muted);
  font-size: 0.75rem;
  :deep(.ve-icon) {
    width: 1rem;
    height: 1rem;
  }
}

.ve-label {
  @include label;
}
.ve-input {
  @include field;
}
.ve-button {
  @include button;
}
.ve-error {
  margin: 0;
  color: var(--ve-error);
  font-size: 0.75rem;
}
</style>
