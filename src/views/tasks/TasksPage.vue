<script setup lang="ts">
import { getBoard } from '@/api/boards'
import { getTasks } from '@/api/tasks'
import NoData from '@/components/NoData.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import { filterTask, isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { Broadcast } from '@/models/global'
import type { TaskWithBoard } from '@/models/tasks'
import { useDataStore } from '@/stores/data'
import { useSocketStore } from '@/stores/socket'
import { Modal } from 'bootstrap'
import { onMounted, ref, watch } from 'vue'

onMounted(() => {
  fetchTasks()
})

const tasks = ref<TaskWithBoard[]>([])

async function fetchTasks() {
  const dataStore = useDataStore()
  if (dataStore.tasks.length > 0) {
    tasks.value = dataStore.tasks
    return
  }

  const response = await getTasks()
  if (isError(response)) return

  tasks.value = await Promise.all(
    response.map(async (task) => {
      const boardResponse = await getBoard(task.board)
      return { ...task, board: isError(boardResponse) ? ({} as Board) : boardResponse }
    }),
  )
  dataStore.tasks = tasks.value
}

const socket = useSocketStore()
watch(
  () => socket.messages,
  (messages) => {
    messages.forEach(async (message: Broadcast) => {
      if (message.type.includes('task')) {
        const newTasks = await filterTask(message)
        tasks.value = newTasks
      }
    })
  },
  { deep: true },
)

function viewTask(id?: string) {
  const modal = document.getElementById('modal--view-' + id)
  if (modal) {
    const modalInstance = new Modal(modal as HTMLElement)
    modalInstance.show()
  }
}

function removeTask(index: number) {
  tasks.value = tasks.value.filter((_, i) => i !== index)
}
</script>

<template>
  <section id="task--view-all" class="section">
    <h2>Your Tasks</h2>
    <p class="text-center text-md-start">Browse all your tasks from here.</p>

    <div
      class="d-flex flex-wrap gap-4 mt-5 w-100 bg-white rounded-3 border p-3 p-md-5"
      :class="{
        'justify-content-center': tasks.length === 0,
        'justify-content-start': tasks.length > 0,
      }"
      style="max-height: 500px; overflow-y: auto"
    >
      <NoData v-if="tasks.length === 0" message="You have no tasks yet." />

      <div v-else v-for="(task, index) in tasks" :key="task.id" class="flex-fill">
        <TaskCard
          :task="{ ...task, board: task.board.id || '' }"
          :board="task.board"
          @delete="removeTask(index)"
          @click="viewTask(task.id)"
        />
        <TaskModal :taskId="task.id" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.task--card:hover {
  background-color: var(--bs-light);
}
</style>
