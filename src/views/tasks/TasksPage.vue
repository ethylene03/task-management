<script setup lang="ts">
import { getBoard } from '@/api/boards'
import { getTasks } from '@/api/tasks'
import ViewTask from '@/components/ViewTask.vue'
import { isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { TaskWithBoard } from '@/models/tasks'
import { Modal } from 'bootstrap'
import { onMounted, ref } from 'vue'

onMounted(() => {
  fetchTasks()
})

const tasks = ref<TaskWithBoard[]>([])

async function fetchTasks() {
  const response = await getTasks()
  if (isError(response)) return

  tasks.value = await Promise.all(
    response.map(async (task) => {
      const boardResponse = await getBoard(task.board)
      return { ...task, board: isError(boardResponse) ? ({} as Board) : boardResponse }
    }),
  )
}

function viewTask(id?: string) {
  const modal = document.getElementById('modal--view-' + id)
  if (modal) {
    const modalInstance = new Modal(modal as HTMLElement)
    modalInstance.show()
  }
}
</script>

<template>
  <section id="task--view-all" class="section">
    <h2 class="my-4">Your Tasks</h2>
    <p class="text-center text-md-start">Browse all your tasks from here.</p>

    <div
      class="d-flex flex-wrap gap-4 mt-5 w-100 bg-white rounded-3 border p-5"
      :class="{
        'justify-content-center': tasks.length === 0,
        'justify-content-start': tasks.length > 0,
      }"
      style="max-height: 500px; overflow-y: auto"
    >
      <div v-if="tasks.length === 0" class="text-center">
        <img src="@/helpers/no-data.avif" alt="No Tasks" class="mb-4" style="max-width: 300px" />
        <p class="mb-3">You have no tasks yet.</p>
      </div>

      <div v-else v-for="task in tasks" :key="task.id" class="flex-fill" style="max-width: 18rem">
        <div
          class="card h-100 shadow-sm task--card cursor-pointer"
          style="min-width: 18rem"
          @click="viewTask(task.id)"
        >
          <div class="card-body">
            <h5 class="card-title text-primary">{{ task.name }}</h5>
            <small>{{ task.board.name }}</small>

            <p class="mt-3 card-text text-truncate">
              {{ task.description }}
            </p>
          </div>
        </div>
        <ViewTask :taskId="task.id" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.task--card:hover {
  background-color: var(--bs-light);
}
</style>
