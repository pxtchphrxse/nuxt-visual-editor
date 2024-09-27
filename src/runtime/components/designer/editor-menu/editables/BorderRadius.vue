<script setup lang="ts">
import { computed } from 'vue'
import tailwindBorderRadius from '../../../../utils/tailwind-border-radius'
import EditorAccordion from '../EditorAccordion.vue'
import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()
const brg = computed({
  get: () => state.borderRadiusGlobal,
  set: value => designer.handleBorderRadiusGlobal(value ?? undefined),
})
const brtl = computed({
  get: () => state.borderRadiusTopLeft,
  set: value => designer.handleBorderRadiusTopLeft(value ?? undefined),
})
const brtr = computed({
  get: () => state.borderRadiusTopRight,
  set: value => designer.handleBorderRadiusTopRight(value ?? undefined),
})
const brbl = computed({
  get: () => state.borderRadiusBottomleft,
  set: value => designer.handleBorderRadiusBottomleft(value ?? undefined),
})
const brbr = computed({
  get: () => state.borderRadiusBottomRight,
  set: value => designer.handleBorderRadiusBottomRight(value ?? undefined),
})
</script>

<template>
  <EditorAccordion>
    <template #title>
      Border Radius
    </template>
    <template #content>
      <p class="myPrimaryParagraph font-medium py-0 my-4">
        Global
      </p>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Radius </label>
        <select
          v-model="brg"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderRadiusGlobal in tailwindBorderRadius.roundedGlobal"
            :key="borderRadiusGlobal"
          >
            {{ borderRadiusGlobal }}
          </option>
        </select>
      </div>
      <p class="myPrimaryParagraph font-medium py-0 my-4">
        Specific
      </p>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Radius top left </label>
        <select
          v-model="brtl"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderRadiusTopLeft in tailwindBorderRadius.roundedTopLeft"
            :key="borderRadiusTopLeft"
          >
            {{ borderRadiusTopLeft }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Radius top right </label>
        <select
          v-model="brtr"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderRadiusTopRight in tailwindBorderRadius.roundedTopRight"
            :key="borderRadiusTopRight"
          >
            {{ borderRadiusTopRight }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Radius bottom left </label>
        <select
          v-model="brbl"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderRadiusBottomleft in tailwindBorderRadius.roundedBottomLeft"
            :key="borderRadiusBottomleft"
          >
            {{ borderRadiusBottomleft }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Radius bottom right </label>
        <select
          v-model="brbr"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderRadiusBottomRight in tailwindBorderRadius.roundedBottomRight"
            :key="borderRadiusBottomRight"
          >
            {{ borderRadiusBottomRight }}
          </option>
        </select>
      </div>
    </template>
  </EditorAccordion>
</template>
