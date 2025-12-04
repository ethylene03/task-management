<script setup lang="ts">
import { getBoards } from '@/api/boards'
import { filterBoard, isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { Broadcast } from '@/models/global'
import { useDataStore } from '@/stores/data'
import { useSocketStore } from '@/stores/socket'
import { ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/solid'
import { onMounted, ref, watch } from 'vue'
import BoardCard from './BoardCard.vue'
import NoData from './NoData.vue'

onMounted(() => {
  fetchBoards()
})

const boards = ref<Board[]>([])
const total = ref(0)
async function fetchBoards() {
  const dataStore = useDataStore()
  if (dataStore.boards.length > 0) {
    boards.value = dataStore.boards
    total.value = dataStore.boards.length
    return
  }

  const response = await getBoards()
  if (isError(response)) return

  total.value = response.length
  boards.value = response
  dataStore.boards = response
}

const socket = useSocketStore()

watch(
  () => socket.messages.length,
  () => {
    socket.messages.forEach((message: Broadcast) => {
      if (message.type.includes('board')) {
        const newBoards = filterBoard(message)
        boards.value = newBoards
        total.value = newBoards.length
      }
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="flex-fill col col-md-6">
    <div id="boards-display--header" class="d-flex align-items-center justify-content-between">
      <div>
        <h4>Your Boards</h4>
        <span class="text-muted">Total Boards: {{ total || 0 }}</span>
      </div>
      <button
        class="btn btn-primary d-flex align-items-center"
        @click="$router.push({ name: 'Create Board' })"
      >
        <plus-icon class="text-center me-2" style="width: 1rem; height: 1rem" />
        Add New Board
      </button>
    </div>

    <div id="boards-display--body" class="bg-white rounded-3 mt-3 border p-3 flex-fill">
      <NoData v-if="boards.length === 0" message="You have no boards yet." />

      <div v-else>
        <span
          id="boards-display--view-all"
          class="d-flex align-items-center text-primary fs-6 justify-content-end mb-3"
          @click="$router.push({ name: 'Boards' })"
          style="cursor: pointer"
        >
          View All
          <ChevronRightIcon class="ms-2" style="width: 1rem; height: 1rem" />
        </span>

        <div id="boards-display--board-cards" class="d-flex flex-column gap-3">
          <BoardCard v-for="board in boards.slice(0, 3)" :key="board.id" :board="board" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card:hover {
  background-color: var(--bs-light);
}
</style>
