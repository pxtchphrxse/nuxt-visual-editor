<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  XMarkIcon,
  SwatchIcon,
} from '@heroicons/vue/24/outline'
import EditorAccordion from '../EditorAccordion.vue'
import SlideOverRight from '../../../slidebars/SlideOverRight.vue'
import { useDesigner } from '../../../../composables/useDesigner'
import ManageBackgroundColor from './ManageBackgroundColor.vue'
import ManageTextColor from './ManageTextColor.vue'
import ManageBackgroundOpacity from './ManageBackgroundOpacity.vue'
import ManageOpacity from './ManageOpacity.vue'

const { state } = useDesigner()

const showBackgroundColorsSlideOverRight = ref(false)
const showTextColorsSlideOverRight = ref(false)
const titleBackgroundColorsSlideOverRight = ref<string | null>(null)
const titleTextColorsSlideOverRight = ref<string | null>(null)

// handle slideover window
const handleBackgroundColorsSlideOver = function () {
  titleBackgroundColorsSlideOverRight.value = 'Background color'
  showBackgroundColorsSlideOverRight.value = true
}
// handle slideover window
const handleTextColorsSlideOver = function () {
  titleTextColorsSlideOverRight.value = 'Text color'
  showTextColorsSlideOverRight.value = true
}
// handle slideover window
const backgroundColorsSlideOverButton = function () {
  showBackgroundColorsSlideOverRight.value = false
}
const textColorsSlideOverButton = function () {
  showTextColorsSlideOverRight.value = false
}

const getBackgroundColor = computed(() => {
  return state.backgroundColor!
})
const getTextColor = computed(() => {
  return state.textColor!
})
const getBackgroundColorCustom = computed(() => {
  return state.backgroundColorCustom!
})
const getTextColorCustom = computed(() => {
  return state.textColorCustom!
})

const rgbToHex = function rgbToHex(r: number, g: number, b: number) {
  return (
    '#'
    + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  )
}

const getBackgroundColorCustomHex = computed(() => {
  const [r, g, b] = getBackgroundColorCustom.value.match(/\d+/g)!.map(Number)
  return rgbToHex(r, g, b)
})
const getTextColorCustomHex = computed(() => {
  const [r, g, b] = getTextColorCustom.value.match(/\d+/g)!.map(Number)
  return rgbToHex(r, g, b)
})
</script>

<template>
  <EditorAccordion>
    <template #title>
      Color & Opacity settings
    </template>
    <template #content>
      <!-- Background color - start -->
      <div class="mb-2">
        <div class="my-3 py-3">
          <label class="myPrimaryInputLabel"> Background color </label>
          <div
            class="flex flex-row justify-between items-center myPrimaryGap py-2.5 px-3 cursor-pointer hover:border-transparent hover:ring-2 hover:ring-myPrimaryBrandColor focus:bg-white rounded-md border border-myPrimaryMediumGrayColor focus:outline-none focus:ring-2 focus:ring-myPrimaryBrandColor focus:border-transparent"
            @click="handleBackgroundColorsSlideOver"
          >
            <div class="relative flex items-center w-full py-0 p-0">
              <div class="flex items-center gap-2 justify-start">
                <div
                  v-if="
                    getBackgroundColor !== null && getBackgroundColor !== 'none'
                  "
                  class="myPrimaryColorPreview w-6 h-6 cursor-pointer"
                  :class="[getBackgroundColor]"
                  :style="{ backgroundColor: getBackgroundColorCustom }"
                />
                <div
                  v-if="getBackgroundColor === 'none'"
                  class="w-6 h-6 cursor-default"
                >
                  <div
                    class="myPrimaryColorPreview bg-gray-50"
                    :style="{ backgroundColor: getBackgroundColorCustom }"
                  >
                    <XMarkIcon
                      v-if="
                        getBackgroundColorCustom === null
                          || getBackgroundColorCustom.length === 0
                      "
                      class="text-myPrimaryErrorColor stroke-2"
                    />
                  </div>
                </div>
                <p
                  v-if="getBackgroundColorCustom"
                  class="myPrimaryParagraph"
                >
                  {{ getBackgroundColorCustomHex }}
                </p>
                <p
                  v-if="!getBackgroundColorCustom"
                  class="myPrimaryParagraph"
                >
                  {{
                    getBackgroundColor === 'none' ? 'None' : getBackgroundColor
                  }}
                </p>
              </div>
            </div>
            <div
              class="border-none rounded flex items-center justify-center h-full w-8"
            >
              <div
                class="myPrimaryParagraph text-myPrimaryDarkGrayColor border-none"
              >
                <SwatchIcon class="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Background color - end -->
      <!-- Text color - start -->
      <div class="mb-2">
        <div class="my-3 py-3">
          <label class="myPrimaryInputLabel"> Text color </label>
          <div
            class="flex flex-row justify-between items-center myPrimaryGap py-2.5 px-3 cursor-pointer hover:border-transparent hover:ring-2 hover:ring-myPrimaryBrandColor focus:bg-white rounded-md border border-myPrimaryMediumGrayColor focus:outline-none focus:ring-2 focus:ring-myPrimaryBrandColor focus:border-transparent"
            @click="handleTextColorsSlideOver"
          >
            <div class="relative flex items-center w-full py-0 p-0">
              <div class="flex items-center gap-2 justify-start">
                <div
                  v-if="getTextColor !== null && getTextColor !== 'none'"
                  class="myPrimaryColorPreview w-6 h-6 cursor-pointer"
                  :class="[getTextColor?.replace('text', 'bg')]"
                  :style="{ backgroundColor: getTextColorCustom }"
                />
                <div
                  v-if="getTextColor === 'none'"
                  class="w-6 h-6 cursor-default"
                >
                  <div
                    class="myPrimaryColorPreview bg-gray-50"
                    :style="{ color: getTextColorCustom }"
                  >
                    <XMarkIcon
                      v-if="
                        getTextColorCustom === null
                          || getTextColorCustom.length === 0
                      "
                      class="text-myPrimaryErrorColor stroke-2"
                    />
                  </div>
                </div>
                <p
                  v-if="getTextColorCustom"
                  class="myPrimaryParagraph"
                >
                  {{ getTextColorCustomHex }}
                </p>
                <p
                  v-if="!getTextColorCustom"
                  class="myPrimaryParagraph"
                >
                  {{ getTextColor === 'none' ? 'None' : getTextColor }}
                </p>
              </div>
            </div>
            <div
              class="border-none rounded flex items-center justify-center h-full w-8"
            >
              <div
                class="myPrimaryParagraph text-myPrimaryDarkGrayColor border-none"
              >
                <SwatchIcon class="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Text color - end -->

      <ManageOpacity />
      <ManageBackgroundOpacity />

      <SlideOverRight
        :open="showBackgroundColorsSlideOverRight"
        :title="titleBackgroundColorsSlideOverRight"
        @slide-over-button="backgroundColorsSlideOverButton"
      >
        <ManageBackgroundColor />
      </SlideOverRight>
      <SlideOverRight
        :open="showTextColorsSlideOverRight"
        :title="titleTextColorsSlideOverRight"
        @slide-over-button="textColorsSlideOverButton"
      >
        <ManageTextColor />
      </SlideOverRight>
    </template>
  </EditorAccordion>
</template>
