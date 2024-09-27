<script setup lang="ts">
import {
  XMarkIcon,
  ChevronUpDownIcon,
} from '@heroicons/vue/24/outline'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import { computed } from 'vue'
import tailwindOpacities from '../../../../utils/tailwind-opacities'
import { useDesigner } from '../../../../composables/useDesigner'

const { state, designer } = useDesigner()
const opacity = computed({
  get: () => state.opacity!,
  set: value => designer.handleOpacity(value),
})
</script>

<template>
  <div class="my-3 py-3">
    <label class="myPrimaryInputLabel"> Opacity</label>

    <Listbox
      v-model="opacity"
      as="div"
    >
      <div class="relative">
        <ListboxButton class="myPrimarySelect">
          <span class="flex items-center">
            <div
              v-if="opacity === 'none'"
              class="aspect-square w-6 h-6"
            >
              <div class="myPrimaryColorPreview bg-gray-100">
                <XMarkIcon class="text-myPrimaryErrorColor" />
              </div>
            </div>

            <div
              v-if="opacity !== 'none'"
              class="aspect-square w-6 h-6 bg-gray-950"
              :class="`${opacity}`"
            />

            <span
              class="block truncate ml-3"
              :class="[opacity !== 'none' ? '' : '']"
            >{{ opacity === 'none' ? 'None' : opacity }}</span>
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
              v-for="elementOpacity in tailwindOpacities.opacities"
              :key="elementOpacity"
              v-slot="{ active }"
              as="template"
              :value="elementOpacity"
              @click="designer.handleOpacity(elementOpacity)"
            >
              <li
                :class="[
                  active ? 'bg-myPrimaryLinkColor text-white' : 'text-gray-900',
                  'relative cursor-default select-none py-2 pl-3 pr-9',
                ]"
              >
                <div class="flex items-center">
                  <div
                    v-if="elementOpacity === 'none'"
                    class="aspect-square w-6 h-6"
                  >
                    <div class="myPrimaryColorPreview bg-gray-100">
                      <XMarkIcon class="text-myPrimaryErrorColor" />
                    </div>
                  </div>

                  <div
                    v-if="elementOpacity !== 'none'"
                    class="aspect-square w-6 h-6 bg-gray-950"
                    :class="`${elementOpacity}`"
                  />
                  <span class="ml-3">{{ elementOpacity }}</span>
                </div>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>
