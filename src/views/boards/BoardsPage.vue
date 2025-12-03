<script setup lang="ts">
import { getBoards } from '@/api/boards'
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
    <h2 class="my-4">Your Boards</h2>
    <p class="text-center text-md-start">Browse all your boards from here.</p>

    <router-link to="/boards/create" class="btn btn-primary"> Create New Board </router-link>

    <div
      class="d-flex flex-wrap gap-4 mt-5 w-100 bg-white rounded-3 border p-5"
      :class="{
        'justify-content-center': boards.length === 0,
        'justify-content-start': boards.length > 0,
      }"
      style="max-height: 500px; overflow-y: auto"
    >
      <div v-if="boards.length === 0" class="text-center">
        <img src="@/helpers/no-data.avif" alt="No Boards" class="mb-4" style="max-width: 300px" />
        <p class="mb-3">You have no boards yet.</p>
      </div>

      <div v-else v-for="board in boards" :key="board.id" class="flex-fill" style="max-width: 18rem">
        <router-link
          :to="{ name: 'View Board', params: { id: board.id } }"
          class="text-decoration-none"
        >
          <div class="card h-100 shadow-sm board--card" style="min-width: 18rem">
            <div class="card-body">
              <h5 class="card-title text-primary">{{ board.name }}</h5>
              <p class="card-text text-truncate">
                {{ board.description }}
              </p>
              <div class="d-flex flex-column">
                <small class="text-secondary"> Members: {{ board.members?.length || 0 }} </small>
                <small class="text-secondary"> Tasks: {{ board.tasks.length }} </small>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board--card:hover {
  background-color: var(--bs-light);
}
</style>
