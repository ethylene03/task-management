<script setup lang="ts">
import { getBoard } from '@/api/boards'
import { getTasks } from '@/api/tasks'
import { isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { TaskWithBoard } from '@/models/tasks'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import { onMounted, ref } from 'vue'

onMounted(() => {
  fetchTasks()
})

const tasks = ref<TaskWithBoard[]>([])
const total = ref(0)
async function fetchTasks() {
  const response = await getTasks()
  if (isError(response)) return

  total.value = response.length
  const topTasks = response.slice(0, 3)

  tasks.value = await Promise.all(
    topTasks.map(async (task) => {
      const boardResponse = await getBoard(task.board)
      return { ...task, board: isError(boardResponse) ? ({} as Board) : boardResponse }
    }),
  )
}
</script>

<template>
  <div class="flex-fill d-flex flex-column">
    <div>
      <h4>Your Tasks</h4>
      <span class="text-muted">Total Tasks: {{ tasks.length || 0 }}</span>
    </div>

    <div class="bg-white rounded-3 mt-3 border p-3 flex-fill">
      <div v-if="tasks.length === 0" class="text-center">
        <img src="@/helpers/no-data.avif" alt="No Tasks" class="mb-4" style="max-width: 300px" />
        <p class="mb-3">You have no tasks yet.</p>
      </div>

      <div v-else>
        <span
          class="d-flex align-items-center text-primary fs-6 justify-content-end mb-3"
          @click="$router.push({ name: 'Tasks' })"
          style="cursor: pointer"
        >
          View All
          <ChevronRightIcon class="ms-2" style="width: 1rem; height: 1rem" />
        </span>
        <div class="d-flex flex-column justify-content-center gap-3 align-items-center">
          <div v-for="task in tasks" :key="task.id">
            <div class="card h-100 shadow-sm" style="width: 18rem">
              <div class="card-body">
                <h5 class="card-title text-primary">{{ task.name }}</h5>
                <p class="card-text text-truncate">
                  {{ task.description }}
                </p>
                <div class="d-flex flex-column">
                  <small class="text-secondary"> Board: {{ (task.board as Board).name }} </small>
                </div>
              </div>
            </div>
          </div>
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
