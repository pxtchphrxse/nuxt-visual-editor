<template>
  <div
    class="flex flex-col"
    :class="{ 'pb-8': expanded }"
  >
    <div
      class="border-t border-myPrimaryLightGrayColor flex flex-row justify-between items-center pl-3 pr-3 py-5 cursor-pointer duration-200 hover:bg-myPrimaryLightGrayColor"
      @click="expanded = !expanded"
    >
      <p class="myPrimaryParagraph font-medium my-0 py-0">
        <slot name="title" />
      </p>
      <ChevronRightIcon
        class="rotate-0 h-5 w-5 transform duration-75"
        :class="{ 'rotate-90': expanded }"
      />
    </div>
    <div
      :class="[expanded ? 'block' : 'hidden']"
      class="px-4 ease-linear duration-75 bg-white mt-4"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const expanded = ref(false)
</script>
