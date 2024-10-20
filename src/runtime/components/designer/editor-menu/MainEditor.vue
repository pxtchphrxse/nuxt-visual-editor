<script setup lang="ts">
import {
  EyeIcon,
  Squares2X2Icon,
  BoltSlashIcon,
} from '@heroicons/vue/24/outline'
import { useDesigner } from '../../../composables/useDesigner'
import ComponentTopMenu from './editables/ComponentTopMenu.vue'

const { state, designer } = useDesigner()

const deselectCurrentComponent = function () {
  state.element = null
  state.component = null
  designer.removeHoveredAndSelected()
}
// const onDrop = (droppedElement, targetIndex, originalEvent) => {
//   console.log(droppedElement, targetIndex, originalEvent)
//   designer.saveCurrentDesignWithTimer()
// }
</script>

<template>
  <!-- eslint-disable vue/attribute-hyphenation -->
  <main
    class="flex flex-col h-full grow rounded-2xl duration-300 shadow-2xl"
  >
    <div
      class="flex items-center justify-between primary-gap rounded-t-2xl bg-myPrimaryLightGrayColor py-2 px-4"
    >
      <div>
        <div class="flex gap-2">
          <span class="w-2 h-2 rounded-full bg-red-400" />
          <span class="w-2 h-2 rounded-full bg-yellow-400" />
          <span class="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div class="flex items-center justify-center gap-2">
        <div
          class="cursor-pointer rounded-full flex items-center justify-center bg-white aspect-square hover:bg-myPrimaryLinkColor hover:text-white"
          @click="state.showPreview = true"
        >
          <EyeIcon class="w-5 h-5 m-2 stroke-1.5 cursor-pointer" />
        </div>
        <div
          v-if="state.element !== null"
          class="cursor-pointer rounded-full flex items-center justify-center bg-white aspect-square hover:bg-myPrimaryLinkColor hover:text-white"
          @click="deselectCurrentComponent"
        >
          <BoltSlashIcon
            class="w-5 h-5 m-2 stroke-1.5 cursor-pointer"
          />
        </div>
        <div
          v-if="state.menuRight === false"
          class="cursor-pointer rounded-full flex items-center justify-center bg-white aspect-square hover:bg-myPrimaryLinkColor hover:text-white"
          @click="state.menuRight = true"
        >
          <Squares2X2Icon
            class="w-5 h-5 m-2 stroke-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
    <!-- <Draggable
      :id="state.designerId"
      :list="state.components"
      animation="200"
      class="pagebuilder bg-white grow overflow-y-auto"
      drag-class="opacity-0"
      group="components"
      handle=".cursor-grab"
      item-key="id"
    >
      <template #item="{ element }">
        <div
          class="relative group"
          @mouseup="state.element=element"
        >
          <ComponentTopMenu />
          <section class="m-0.5" v-html="element.html" />
        </div>
      </template>
    </Draggable> -->
    <div
      :id="state.designerId"
      class="pagebuilder bg-white grow overflow-y-auto"
    >
      <div
        v-for="element in state.components"
        :key="element.id"
        class="relative group"
        data-sortable="true"
        @mouseup="state.element = element as any"
      >
        <ComponentTopMenu />
        <!-- eslint-disable-next-line -->
      <section class="m-0.5" v-html="element.html" />
      </div>
    </div>
  </main>
</template>
