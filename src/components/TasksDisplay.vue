<script setup lang="ts">
import { getBoard } from '@/api/boards'
import { getTasks } from '@/api/tasks'
import { filterTask, isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { Broadcast } from '@/models/global'
import type { TaskWithBoard } from '@/models/tasks'
import { useDataStore } from '@/stores/data'
import { useSocketStore } from '@/stores/socket'
import { ChevronRightIcon } from '@heroicons/vue/24/solid'
import { Modal } from 'bootstrap'
import { onMounted, ref, watch } from 'vue'
import NoData from './NoData.vue'
import TaskModal from './TaskModal.vue'

onMounted(() => {
  fetchTasks()
})

const tasks = ref<TaskWithBoard[]>([])
const total = ref(0)
async function fetchTasks() {
  const dataStore = useDataStore()
  if (dataStore.tasks.length > 0) {
    tasks.value = dataStore.tasks
    total.value = dataStore.tasks.length
    return
  }

  const response = await getTasks()
  if (isError(response)) return

  total.value = response.length
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
        total.value = newTasks.length
      }
    })
  },
  { deep: true },
)

function viewTask(id?: string) {
  if (!id) return
  const modal = document.getElementById('modal--view-' + id)
  if (modal) {
    const modalInstance = new Modal(modal as HTMLElement)
    modalInstance.show()
  }
}
</script>

<template>
  <div class="flex-fill col col-md-6">
    <div id="tasks-display--header">
      <h4>Your Tasks</h4>
      <span class="text-muted">Total Tasks: {{ tasks.length || 0 }}</span>
    </div>

    <div id="tasks-display--body" class="bg-white rounded-3 mt-3 border p-3 flex-fill">
      <NoData v-if="tasks.length === 0" message="You have no tasks yet." />

      <div v-else>
        <span
          id="tasks-display--view-all"
          class="d-flex align-items-center text-primary fs-6 justify-content-end mb-3"
          @click="$router.push({ name: 'Tasks' })"
          style="cursor: pointer"
        >
          View All
          <ChevronRightIcon class="ms-2" style="width: 1rem; height: 1rem" />
        </span>

        <div id="tasks-display--task-cards" class="d-flex flex-column gap-3">
          <template v-for="task in tasks.slice(0, 3)" :key="task.id">
            <div class="w-100 card h-100 shadow-sm cursor-pointer" @click="viewTask(task.id)">
              <div class="card-body">
                <h5 class="card-title text-primary">{{ task.name || 'Task' }}</h5>
                <p class="card-text text-truncate">
                  {{ task.description }}
                </p>
                <div class="d-flex flex-column">
                  <small class="text-secondary"> Board: {{ (task.board as Board).name }} </small>
                </div>
              </div>
            </div>
            <TaskModal :taskId="task.id" />
          </template>
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
