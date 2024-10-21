<script setup lang="ts">
import { ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import { computed } from 'vue'
import { provideUseId, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import EditorAccordion from '../EditorAccordion.vue'
import tailwindBorderStyleWidthPlusColor from '../../../../utils/tailwind-border-style-width-color'
import { useDesigner } from '../../../../composables/useDesigner'

import { useId } from '#imports'

provideUseId(() => useId()!)

const { state, designer } = useDesigner()
const _borderStyle = computed({
  get: () => state.borderStyle,
  set: (value) => {
    designer.handleBorderStyle(value ?? undefined)
  },
})
const _borderWidth = computed({
  get: () => state.borderWidth,
  set: (value) => {
    designer.handleBorderWidth(value ?? undefined)
  },
})
</script>

<template>
  <EditorAccordion>
    <template #title>
      Border Style, Width & Color
    </template>
    <template #content>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Style </label>
        <select
          v-model="_borderStyle"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderStyle in tailwindBorderStyleWidthPlusColor.borderStyle"
            :key="borderStyle"
          >
            {{ borderStyle }}
          </option>
        </select>
      </div>
      <div class="my-3 py-3">
        <label class="myPrimaryInputLabel"> Border Width </label>
        <select
          v-model="_borderWidth"
          class="myPrimarySelect"
        >
          <option
            disabled
            value=""
          >
            Select
          </option>
          <option
            v-for="borderWidth in tailwindBorderStyleWidthPlusColor.borderWidth"
            :key="borderWidth"
          >
            {{ borderWidth }}
          </option>
        </select>
      </div>

      <label class="myPrimaryInputLabel"> Border Color </label>
      <Listbox
        :value="state.borderColor"
        as="div"
      >
        <div class="relative mt-2">
          <ListboxButton class="myPrimarySelect">
            <span class="flex items-center">
              <div
                v-if="state.borderColor !== 'none'"
                class="aspect-square w-6 h-6"
                :class="`bg-${state.borderColor?.replace('border-', '')}`"
              />
              <span
                class="block truncate"
                :class="[state.borderColor !== 'none' ? 'ml-3' : '']"
              >{{ state.borderColor }}</span>
            </span>
            <span
              class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <ListboxOption
                v-for="color in tailwindBorderStyleWidthPlusColor.borderColor"
                :key="color"
                v-slot="{ active }"
                as="template"
                :value="color"
                @click="() => designer.handleBorderColor(color)"
              >
                <li
                  :class="[
                    active
                      ? 'bg-myPrimaryLinkColor text-white'
                      : 'text-gray-900',
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                  ]"
                >
                  <div class="flex items-center">
                    <div
                      class="aspect-square w-6 h-6"
                      :class="`bg-${color.replace('border-', '')}`"
                    />
                    <span class="ml-3">{{ color }}</span>
                  </div>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </template>
  </EditorAccordion>
</template>
