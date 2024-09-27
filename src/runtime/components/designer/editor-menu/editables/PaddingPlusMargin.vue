<script setup lang="ts">
import { computed } from 'vue'
import tailwindPaddingPlusMargin from '../../../../utils/tailwind-padding-margin'
import EditorAccordion from '../EditorAccordion.vue'
import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()
const fontVerticalPadding = computed({
  get: () => state.fontVerticalPadding,
  set: value => designer.handleVerticalPadding(value ?? undefined),
})
const fontHorizontalPadding = computed({
  get: () => state.fontHorizontalPadding,
  set: value => designer.handleHorizontalPadding(value ?? undefined),
})
const fontVerticalMargin = computed({
  get: () => state.fontVerticalMargin,
  set: value => designer.handleVerticalMargin(value ?? undefined),
})
const fontHorizontalMargin = computed({
  get: () => state.fontHorizontalMargin,
  set: value => designer.handleHorizontalMargin(value ?? undefined),
})
</script>

<template>
  <EditorAccordion>
    <template #title>
      Padding & Margin
    </template>
    <template #content>
      <p class="myPrimaryParagraph font-medium py-0 my-4">
        Padding
      </p>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Padding Y-axis </label>
        <select
          v-model="fontVerticalPadding"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="verticalPadding in tailwindPaddingPlusMargin.verticalPadding"
            :key="verticalPadding"
          >
            {{ verticalPadding }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Padding X-axis </label>
        <select
          v-model="fontHorizontalPadding"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="horizontalPadding in tailwindPaddingPlusMargin.horizontalPadding"
            :key="horizontalPadding"
          >
            {{ horizontalPadding }}
          </option>
        </select>
      </div>
      <p class="myPrimaryParagraph font-medium py-0 my-4">
        Margin
      </p>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Margin Y-axis </label>
        <select
          v-model="fontVerticalMargin"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="verticalMargin in tailwindPaddingPlusMargin.verticalMargin"
            :key="verticalMargin"
          >
            {{ verticalMargin }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Margin X-axis </label>
        <select
          v-model="fontHorizontalMargin"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="horizontalMargin in tailwindPaddingPlusMargin.horizontalMargin"
            :key="horizontalMargin"
          >
            {{ horizontalMargin }}
          </option>
        </select>
      </div>
    </template>
  </EditorAccordion>
</template>
