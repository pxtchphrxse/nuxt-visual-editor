<script setup lang="ts">
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { ref, useId } from 'vue'
import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()

const id = useId()

const onSelectFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  updateImage(file)
}
const isDragging = ref(false)
const onDropFile = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Only image file are allowed!')
    return
  }
  updateImage(file)
}

const updateImage = (file: File) => {
  const reader = new FileReader()
  reader.onloadend = function () {
    // Get base64 string
    const base64String = reader.result
    if (!base64String) return
    state.highlightedImage = { file: base64String?.toString() }
    designer.updateBasePrimaryImage()
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <!-- eslint-disable vue/html-self-closing -->
  <div
    v-if="state.basePrimaryImage !== null"
    class="p-1"
    :class="{ 'rounded-md outline-dashed outline-4 outline-[rgb(185,16,16)] -outline-offset-4': isDragging }"
    @dragover.prevent.stop="isDragging = true"
    @dragleave.prevent.stop="isDragging = false"
    @drop.prevent="onDropFile"
  >
    <input
      :id="id"
      ref="file"
      type="file"
      accept="image/*"
      hidden
      @change="onSelectFile"
    />

    <label
      :for="id"
    >
      <div class="relative">
        <img
          class="object-cover object-center w-full"
          :src="state.basePrimaryImage"
          alt="image"
        />
        <div
          class="absolute inset-0 bg-white/80 grid place-items-center"
          :class="{ 'opacity-0': !isDragging }"
        >
          <CloudArrowUpIcon class="text-myPrimaryLinkColor w-20" />
        </div>
      </div>

      <div class="my-4 px-4 space-y-2">
        <button
          type="button"
          class="myPrimaryButton gap-2 items-center w-full"
          @click.prevent="($refs.file as HTMLInputElement)?.click()"
        >
          <PhotoIcon class="w-4 h-4 stroke-2" />
          Update image
        </button>
        <p class="text-center text-slate-600 font-light"><b>Choose a file</b> or drag it here.</p>
      </div>
    </label>
  </div>
</template>
