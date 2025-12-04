<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const isClicked = ref<boolean>(false)

const emit = defineEmits<{ (event: 'delete'): void }>()
const { id } = defineProps<{ id: string }>()

watch(isClicked, () => {
  if (isClicked.value) emit('delete')
})

onMounted(() => {
  const modal = document.getElementById('modal--delete')
  modal?.addEventListener('hidden.bs.modal', () => {
    isClicked.value = false
  })
})
</script>

<template>
  <div class="modal fade" :id="'modal--delete-' + id" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-bottom-0">
          <h1 class="modal-title fs-5">Delete Data</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-center py-4">
          Deleting this data is not reversible. Are you sure you want to delete?
        </div>
        <div class="modal-footer border-top-0 justify-content-center gap-4">
          <button type="button" class="btn btn-outline-primary px-5" data-bs-dismiss="modal">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger px-5"
            @click="isClicked = true"
            :disabled="isClicked"
          >
            <div
              v-if="isClicked"
              class="spinner-border spinner-border-sm text-primary d-block mx-auto my-1"
              role="status"
            ></div>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
