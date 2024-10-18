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

const categories = ref(
  [
    'forms',
    'teams',
    'posts',
    'features',
    'headers',
    'testimonials',
  ])
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
</script>

<template>
  <aside
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
    <div class="sticky h-full w-60 overflow-hidden">
      <nav
        aria-label="Sidebar"
        class="h-full bg-white pt-2.5 pr-0 pb-4 pl-4"
      >
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
        <ul
          class="flex flex-col pt-4 pr-0 pb-0 font-normal h-full overflow-y-auto"
          @mouseover.self="state.menuPreview = false"
        >
          <li
            v-for="category in categories"
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
      :class="[!state.menuPreview ? '-left-[30rem]' : 'left-56']"
      class="absolute z-10 w-[20rem] h-full duration-200 top-0 rounded-r-2xl shadow-2xl bg-gray-50"
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
