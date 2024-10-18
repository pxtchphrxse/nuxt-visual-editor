<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useDesigner } from '../../../composables/useDesigner'

import ClassEditor from './editables/ClassEditor.vue'
import Borders from './editables/Borders.vue'
import BorderRadius from './editables/BorderRadius.vue'
import PaddingPlusMargin from './editables/PaddingPlusMargin.vue'
import ColorEditor from './editables/ColorEditor.vue'
import Typography from './editables/Typography.vue'
import LinkEditor from './editables/LinkEditor.vue'
import TextContent from './editables/TextContent.vue'
import ImageEditor from './editables/ImageEditor.vue'

const { state, designer } = useDesigner()

const isHeadingElement = computed(() => {
  return (
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    (state.element?.tagName && state.element?.innerText.trim() !== ' ') || state.element?.tagName === 'img')
})
</script>

<template>
  <aside
    aria-label="Menu"
    :class="{ 'w-0': !state.menuRight, 'w-80 ml-4': state.menuRight }"
    class="h-full duration-300 z-20 flex-shrink-0 overflow-hidden shadow-2xl rounded-l-2xl bg-white"
    @mouseleave="designer.previewCurrentDesign"
  >
    <div class="h-full w-80 bg-white">
      <div class="flex flex-col overflow-y-auto h-full">
        <div
          class="flex flex-row justify-between pt-2.5 pr-4 pl-4 items-center mb-3 sticky top-0 bg-white z-10"
        >
          <div
            class="hover:bg-myPrimaryLinkColor hover:text-white bg-gray-100 rounded-full cursor-pointer"
            @click="state.menuRight = false"
          >
            <XMarkIcon class="shrink-0 w-5 h-5 m-2" />
          </div>
          <p class="font-bold text-sm">
            Editing
            <span class="lowercase">&lt;{{ state.element?.tagName }}&gt;</span>
          </p>
        </div>

        <div class="mb-4">
          <div v-show="isHeadingElement">
            <article>
              <ImageEditor />
            </article>
            <article>
              <TextContent />
            </article>
            <article>
              <LinkEditor />
            </article>
            <article>
              <Typography />
            </article>
            <article>
              <ColorEditor />
            </article>
            <article>
              <PaddingPlusMargin />
            </article>
            <article>
              <BorderRadius />
            </article>
            <article>
              <Borders />
            </article>
            <article>
              <ClassEditor />
            </article>
          </div>

          <!-- <article> -->
          <!--   <div -->
          <!--     v-show="isHeadingElement || getRestoredElement !== null" -->
          <!--   > -->
          <!--     <DeleteElement /> -->
          <!--   </div> -->
          <!-- </article> -->
          <!-- <article class="min-h-[20em]" /> -->
        </div>
      </div>
    </div>
  </aside>
</template>
