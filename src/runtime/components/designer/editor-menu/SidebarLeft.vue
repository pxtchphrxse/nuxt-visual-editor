<script setup lang="ts">
import Draggable from 'vuedraggable'
import {
  Square3Stack3DIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { computed, nextTick, ref, watch } from 'vue'
import { useDesigner } from '../../../composables/useDesigner'
import type { ComponentOption } from '../../../utils/designer'

const { state, designer } = useDesigner()

const activeLibrary = ref<string>()
const componentsMenu = computed(() => {
  return state.fetchedComponents.components?.filter((component) => {
    return component.category === activeLibrary.value
  })
})
const cloneComponent = (comp: ComponentOption) => {
  designer.cloneCompObjForDOMInsertion(comp)
}
const addComponent = (comp: ComponentOption) => {
  const cloned = designer.cloneCompObjForDOMInsertion(comp)
  state.components.push(cloned)
  designer.saveCurrentDesignWithTimer()
  designer.addClickAndHoverEvents()
}
watch(
  () => state.components.map(c => c.id),
  () => {
    nextTick(() => {
      designer.previewCurrentDesign()
    })
  }, { deep: true },
)
const wrapper = ref<HTMLElement>()
const top = computed(() => {
  return (wrapper.value?.getBoundingClientRect().top || 0) + 'px'
})
const left = computed(() => {
  return (wrapper.value?.getBoundingClientRect().left || 0) + 224 + 'px'
})
</script>

<template>
  <aside
    ref="wrapper"
    aria-label="sidebar"
    :class="{
      'w-0': !state.menuLeft,
      'w-60': state.menuLeft,
      'rounded-r-[0rem]': state.menuPreview,
    }"
    class="h-full flex-shrink-0 shadow-2xl rounded-r-2xl overflow-hidden mr-4 duration-150"
    @mouseleave="state.menuPreview = false"
  >
    <!-- Category - start -->
    <div class="h-full w-60 overflow-x-hidden overflow-y-auto">
      <nav
        aria-label="Sidebar"
        class="h-full bg-white pl-4"
      >
        <div class="sticky top-0 bg-white pt-2.5">
          <div class="flex flex-row justify-end border-b pb-3 mb-3 pr-4">
            <div
              class="hover:bg-myPrimaryLinkColor hover:text-white bg-gray-100 rounded-full cursor-pointer"
              @click="
                state.menuLeft = false;
                state.menuPreview = false
              "
            >
              <XMarkIcon class="shrink-0 w-5 h-5 m-2" />
            </div>
          </div>

          <p class="myPrimaryParagraph font-medium pt-4 pr-4">
            COMPONENTS
          </p>
        </div>

        <ul
          class="flex flex-col pt-4 pr-0 pb-4 font-normal"
          @mouseover.self="state.menuPreview = false"
        >
          <li
            v-for="category in state.fetchedComponents.categories"
            :key="category"
            :class="{
              'bg-gray-100 text-gray-900':
                activeLibrary === category && state.menuPreview === true,
            }"
            class="w-full myPrimaryParagrap font-medium py-4 pl-2 pr-0 capitalize cursor-pointer rounded-l-lg"
            @mouseover="
              activeLibrary = category;
              state.menuPreview = true
            "
          >
            {{ category }}
          </li>
        </ul>
      </nav>
    </div>
    <!-- Category - end -->

    <!-- Preview - start -->
    <aside
      aria-label="saidebar"
      :style="{ top, left: !state.menuPreview ? '-30rem' : left }"
      class="fixed z-10 w-[20rem] duration-200 top-0 rounded-r-2xl shadow-2xl bg-gray-50"
    >
      <div class="flex flex-col gap-4 p-4 h-full font-normal">
        <p class="myPrimaryParagraph capitalize">
          {{ activeLibrary }}
        </p>
        <!-- TODO: fix drag and drop to MainEditor -->
        <Draggable
          v-if="false"
          :clone="cloneComponent"
          :group="{ name: 'components', pull: 'clone', put: false }"
          :list="componentsMenu"
          :sort="false"
          class="flex flex-col gap-4 pr-4 overflow-y-auto"
          item-key="id"
        >
          <template #item="{ element }">
            <div v-if="element">
              <img
                :alt="element.name"
                :src="element.imageSrc"
                class="border-2 border-myPrimaryLightGrayColor hover:border-myPrimaryBrandColor rounded-md cursor-grab duration-200"
              >
            </div>
          </template>
        </Draggable>
        <div
          v-for="(element, index) in componentsMenu"
          :key="`${element.name}-${element.category}-${index}`"
          @click="addComponent(element)"
        >
          <img
            :alt="element.name"
            :src="element.imageSrc"
            class="border-2 border-myPrimaryLightGrayColor hover:border-myPrimaryBrandColor rounded-md cursor-pointer duration-200"
          >
        </div>
      </div>
    </aside>
    <!-- Preview - end -->
  </aside>
  <!-- Toggle - start -->
  <div
    v-show="state.menuLeft === false"
    class="pt-2 mr-4 h-full flex-shrink-0 overflow-hidden"
  >
    <div
      class="cursor-pointer rounded-full flex items-center justify-center bg-gray-100 aspect-square hover:bg-myPrimaryLinkColor hover:text-white"
      @click="state.menuLeft = true"
    >
      <Square3Stack3DIcon class="shrink-0 w-6 h-6 m-2 cursor-pointer" />
    </div>
  </div>
</template>
