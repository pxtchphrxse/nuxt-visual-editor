<script setup lang="ts">
import {
  TrashIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import DynamicModal from '../../../modal/DynamicModal.vue'
import { useDesigner } from '../../../../composables/useDesigner'

const { designer } = useDesigner()

const showModalDeleteComponent = ref(false)

// use dynamic model
const typeModal = ref('')
const gridColumnModal = ref(Number(1))
const titleModal = ref('')
const descriptionModal = ref('')
const firstButtonModal = ref<string | null>('')
const secondButtonModal = ref<string | null>(null)
const thirdButtonModal = ref<string | null>(null)
// set dynamic modal handle functions
const firstModalButtonFunction = ref<(() => void) | undefined>()
const thirdModalButtonFunction = ref<(() => void) | undefined>()

// remove component
const deleteComponent = function (e: Event) {
  // set modal standards
  showModalDeleteComponent.value = true
  typeModal.value = 'delete'
  gridColumnModal.value = 2
  titleModal.value = 'Delete component'
  descriptionModal.value = 'Are you sure you want to delete this component?'
  firstButtonModal.value = 'Close'
  thirdButtonModal.value = 'Delete'

  // handle click
  firstModalButtonFunction.value = function () {
    // set open modal
    showModalDeleteComponent.value = false
  }
  //
  // handle click
  thirdModalButtonFunction.value = function () {
    designer.deleteComponent(e)
    // set open modal
    showModalDeleteComponent.value = false
  }
  // end modal
}
//
</script>

<template>
  <DynamicModal
    :show="showModalDeleteComponent"
    :type="typeModal"
    :grid-column-amount="gridColumnModal"
    :title="titleModal"
    :description="descriptionModal"
    :first-button-text="firstButtonModal"
    :second-button-text="secondButtonModal"
    :third-button-text="thirdButtonModal"
    @first-modal-button-function="firstModalButtonFunction"
    @third-modal-button-function="thirdModalButtonFunction"
  />
  <div
    class="mx-auto mt-4 bg-myPrimaryLightGrayColor absolute z-20 overflow-hidden left-0 right-0 top-0 text-myPrimaryDarkGrayColor border border-gray-400 duration-100 transform group-hover:block hidden max-w-[80%] rounded-full shadow-sm"
  >
    <div class="flex flex-row justify-between mx-auto py-1.5 px-3 max-w-6xl">
      <div class="flex gap-2 items-center justify-center">
        <div
          class="cursor-pointer rounded-full flex items-center justify-center bg-white aspect-square hover:bg-myPrimaryErrorColor hover:text-white"
          @click="deleteComponent($event)"
        >
          <TrashIcon class="w-4 h-4 m-2 stroke-2" />
        </div>
      </div>

      <div class="flex gap-2 items-center justify-center">
        <div
          class="cursor-pointer rounded-full flex items-center justify-center bg-white aspect-square hover:bg-myPrimaryLinkColor hover:text-white"
          @click="designer.moveComponent($event, 1)"
        >
          <ArrowDownIcon class="w-4 h-4 m-2 stroke-2" />
        </div>
        <div
          class="cursor-pointer rounded-full flex items-center justify-center bg-white aspect-square hover:bg-myPrimaryLinkColor hover:text-white"
          @click="designer.moveComponent($event, -1)"
        >
          <ArrowUpIcon class="w-4 h-4 m-2 stroke-2" />
        </div>
      </div>
    </div>
  </div>
</template>
