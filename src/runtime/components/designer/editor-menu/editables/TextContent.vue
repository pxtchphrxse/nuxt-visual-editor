<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()

const getElement = computed(() => {
  return state.element
})

const getBasePrimaryImage = computed(() => {
  return state.basePrimaryImage
})

// Default value for showTextArea
const showTextArea = ref(true)

// get outer HTML of current element
const getElementInnerHTML = computed(() => {
  return getElement?.value?.innerHTML ? getElement?.value?.innerHTML : []
})

// watch and show text area based "get current element" content
// only show text area if it's include text only plus if containing <br>
watch(getElementInnerHTML, (newElementInnerHTML) => {
  // stop execution if
  if (typeof newElementInnerHTML !== 'string') {
    return
  }

  let newElementClone = newElementInnerHTML

  // check for br tags and replace br tags with empty space
  newElementClone = newElementClone.replace(/<br\s*\/?>/gi, '')
  newElementClone = newElementClone?.replaceAll('<br>', '')
  newElementClone = newElementClone?.replaceAll('<br/>', '')
  newElementClone = newElementClone?.replaceAll('<br />', '')

  // check for any html
  // if test return true, the element is containing html
  const containsHTML = /<\/?[a-z][\s\S]*>/i.test(newElementClone)

  // if test return true, the element is containing html
  if (containsHTML === true || newElementClone.length >= 0) {
    showTextArea.value = false
  }
  if (containsHTML === false) {
    showTextArea.value = true
  }
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    v-if="showTextArea === true && getBasePrimaryImage === null"
    class="my-2 pb-8"
  >
    <div class="block px-4 ease-linear duration-200 bg-white">
      <label class="myPrimaryInputLabel"> Text content </label>

      <textarea
        :value="designer.decodeHTML(state.textAreaVueModel??'')"
        rows="12"
        class="myPrimaryTextArea"
        @input="designer.changeText"
      />
      <!-- @input="designer.changeText" -->
      <!-- v-html="textContentVueModel" -->
    </div>
  </div>
</template>
