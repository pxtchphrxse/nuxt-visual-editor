<script setup lang="ts">
import { computed } from 'vue'
import EditorAccordion from '../EditorAccordion.vue'
import tailwindFontSizes from '../../../../utils/tailwind-font-sizes'
import tailwindFontStyles from '../../../../utils/tailwind-font-styles'
import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()

const fontBase = computed({
  get: () => state.fontBase,
  set: value => designer.handleFontSize(value!),
})
const fontDesktop = computed({
  get: () => state.fontDesktop,
  set: value => designer.handleFontSize(value!),
})
const fontTablet = computed({
  get: () => state.fontTablet,
  set: value => designer.handleFontSize(value!),
})
const fontMobile = computed({
  get: () => state.fontMobile,
  set: value => designer.handleFontSize(value!),
})
const fontWeight = computed({
  get: () => state.fontWeight,
  set: value => designer.handleFontWeight(value!),
})
const fontFamily = computed({
  get: () => state.fontFamily,
  set: value => designer.handleFontFamily(value!),
})
const fontStyle = computed({
  get: () => state.fontStyle,
  set: value => designer.handleFontStyle(value!),
})
</script>

<template>
  <EditorAccordion>
    <template #title>
      Typographies
    </template>
    <template #content>
      <!-- FONT SIZES -->
      <p class="myPrimaryParagraph font-medium py-0 my-4">
        Font sizes
      </p>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font Base </label>
        <select
          v-model="fontBase"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontSize in tailwindFontSizes.fontBase"
            :key="fontSize"
          >
            {{ fontSize }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font desktop size </label>
        <select
          v-model="fontDesktop"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontSize in tailwindFontSizes.fontDesktop"
            :key="fontSize"
          >
            {{ fontSize }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font tablet size </label>
        <select
          v-model="fontTablet"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontSize in tailwindFontSizes.fontTablet"
            :key="fontSize"
          >
            {{ fontSize }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font mobile size </label>
        <select
          v-model="fontMobile"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontSize in tailwindFontSizes.fontMobile"
            :key="fontSize"
          >
            {{ fontSize }}
          </option>
        </select>
      </div>
      <hr>
      <p class="myPrimaryParagraph font-medium py-0 my-4">
        Font general
      </p>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font weight </label>
        <select
          v-model="fontWeight"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontW in tailwindFontStyles.fontWeight"
            :key="fontW"
          >
            {{ fontW }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font family </label>
        <select
          v-model="fontFamily"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontF in tailwindFontStyles.fontFamily"
            :key="fontF"
          >
            {{ fontF }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Font Style </label>
        <select
          v-model="fontStyle"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="fontS in tailwindFontStyles.fontStyle"
            :key="fontS"
          >
            {{ fontS }}
          </option>
        </select>
      </div>
    </template>
  </EditorAccordion>
</template>
