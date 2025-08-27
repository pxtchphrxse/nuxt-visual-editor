<script setup lang="ts">
import { computed } from 'vue'
import {
  XMarkIcon,
  ChevronUpDownIcon,
} from '@heroicons/vue/24/outline'
import { provideUseId, Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import tailwindOpacities from '../../../../utils/tailwind-opacities'
import { useDesigner } from '../../../../composables/useDesigner'
import { useId } from '#imports'

provideUseId(() => useId()!)

const { state, designer } = useDesigner()

const backgroundOpacity = computed({
  get: () => state.backgroundOpacity!,
  set: value => designer.handleBackgroundOpacity(value),
})
</script>

<template>
  <div class="my-3 py-3">
    <label class="myPrimaryInputLabel"> Background opacity</label>

    <Listbox
      v-model="backgroundOpacity"
      as="div"
    >
      <div class="relative">
        <ListboxButton class="myPrimarySelect">
          <span class="flex items-center">
            <div
              v-if="backgroundOpacity === 'none'"
              class="aspect-square w-6 h-6"
            >
              <div class="myPrimaryColorPreview bg-gray-100">
                <XMarkIcon class="text-myPrimaryErrorColor" />
              </div>
            </div>

            <div
              v-if="backgroundOpacity !== 'none'"
              class="aspect-square w-6 h-6 bg-gray-950"
              :class="`${backgroundOpacity}`"
            />

            <span
              class="block truncate ml-3"
              :class="[backgroundOpacity !== 'none' ? '' : '']"
            >{{ backgroundOpacity === 'none' ? 'None' : backgroundOpacity }}</span>
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
              v-for="bo in tailwindOpacities.backgroundOpacities"
              :key="bo"
              v-slot="{ active }"
              as="template"
              :value="bo"
              @click="designer.handleBackgroundOpacity(bo)"
            >
              <li
                :class="[
                  active ? 'bg-myPrimaryLinkColor text-white' : 'text-gray-900',
                  'relative cursor-default select-none py-2 pl-3 pr-9',
                ]"
              >
                <div class="flex items-center">
                  <div
                    v-if="bo === 'none'"
                    class="aspect-square w-6 h-6"
                  >
                    <div class="myPrimaryColorPreview bg-gray-100">
                      <XMarkIcon class="text-myPrimaryErrorColor" />
                    </div>
                  </div>

                  <div
                    v-if="bo !== 'none'"
                    class="aspect-square w-6 h-6 bg-gray-950"
                    :class="`${bo}`"
                  />
                  <span class="ml-3">{{ bo }}</span>
                </div>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>
