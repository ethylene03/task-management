<script setup lang="ts">
import { getBoards } from '@/api/boards'
import BoardCard from '@/components/BoardCard.vue'
import NoData from '@/components/NoData.vue'
import { isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import { onMounted, ref } from 'vue'

onMounted(() => {
  fetchBoards()
})

const boards = ref<Board[]>([])

async function fetchBoards() {
  const response = await getBoards()
  if (isError(response)) return

  boards.value = response
}
</script>

<template>
  <section id="board--view-all" class="section">
    <h2>Your Boards</h2>
    <p class="text-center text-md-start mb-4">Browse all your boards from here.</p>

    <router-link to="/boards/create" class="btn btn-primary"> Create New Board </router-link>

    <div
      id="board--cards-container"
      class="mt-5 bg-white rounded-3 border p-3 p-md-5 w-100"
      :class="{
        'justify-content-center': boards.length === 0,
        'justify-content-start': boards.length > 0,
      }"
      style="max-height: 500px; overflow-y: auto"
    >
      <NoData v-if="boards.length === 0" message="You have no boards yet." />
      <BoardCard v-else v-for="board in boards" :key="board.id" :board="board" />
    </div>
  </section>
</template>

<style scoped>
#board--cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.board--card:hover {
  background-color: var(--bs-light);
}
</style>
