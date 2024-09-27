<script setup lang="ts">
import { ref } from 'vue'
import EditorAccordion from '../EditorAccordion.vue'

import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()

const inputClass = ref('')
</script>

<template>
  <EditorAccordion>
    <template #title>
      Generated CSS
    </template>
    <template #content>
      <div class="flex flex-row flex-wrap gap-2 mt-2 mb-4">
        <p
          v-for="className in state.currentClasses"
          :key="className"
          class="flex items-center myPrimaryTag cursor-pointer hover:bg-myPrimaryLinkColor hover:text-white"
          @click="designer.handleRemoveClasses(className)"
        >
          <span class="mr-1">
            {{ className }}
          </span>
        </p>
      </div>

      <div class="flex gap-2 item-center flex-col">
        <div class="flex gap-2 item-center">
          <div
            class="mt-1 relative flex items-center w-full border myPrimaryInput py-0 p-0"
          >
            <input
              v-model="inputClass"
              type="text"
              placeholder="Type class"
              autocomplete="off"
              class="myPrimaryInput border-none rounded-r-none ml-0 w-full"
              @keydown.enter="designer.handleAddClasses(inputClass)"
            >
            <div
              class="border border-gray-200 border-none rounded flex items-center justify-center h-full w-8"
            >
              <kbd class="myPrimaryParagraph text-gray-400 border-none">
                ⏎
              </kbd>
            </div>
          </div>
        </div>
        <p class="myPrimaryInputError" />
      </div>
    </template>
  </EditorAccordion>
</template>
