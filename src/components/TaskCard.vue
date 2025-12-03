<script setup lang="ts">
import { addTask, deleteTask, updateTask } from '@/api/tasks'
import { debounce, isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { Task, TaskWithBoard } from '@/models/tasks'
import { TrashIcon } from '@heroicons/vue/24/solid'
import { onMounted, ref, watch } from 'vue'

onMounted(() => {
  debouncedSave.value = debounce(handleSubmit, 500)
})

const debouncedSave = ref<(() => void) | null>(null)
const { task, board } = defineProps<{ task: Task; board: Board }>()
const taskCopy = ref<TaskWithBoard>({ ...task, board: board } as TaskWithBoard)
const savedTasks = ref<Task | null>(task.id ? { ...task } : null)
const isSaving = ref(false)

watch(
  () => taskCopy.value,
  () => {
    isSaving.value = true
    if (debouncedSave.value) {
      debouncedSave.value?.()
    }
  },
  { deep: true },
)

const saveController = ref<AbortController | null>(null)
async function handleSubmit() {
  if (saveController.value) saveController.value.abort()
  saveController.value = new AbortController()

  const newTaskDetails = {
    ...taskCopy.value,
    id: savedTasks.value?.id,
    board: (taskCopy.value.board as Board).id,
  } as Task

  let response
  if (savedTasks.value) {
    response = await updateTask(newTaskDetails, saveController.value.signal)
  } else {
    response = await addTask(newTaskDetails, saveController.value.signal)
  }

  if (isError(response)) return
  savedTasks.value = { ...response }
  isSaving.value = false
}

const emit = defineEmits(['delete'])
async function removeTask() {
  await deleteTask(savedTasks.value?.id as string)
  emit('delete')
}

const showMenu = ref(false)
const statusList: ('To-Do' | 'Ongoing' | 'Done')[] = ['To-Do', 'Ongoing', 'Done']
function setStatus(status: 'To-Do' | 'Ongoing' | 'Done') {
  taskCopy.value.status = status
  showMenu.value = false
}
</script>

<template>
  <form class="card p-3 h-100 shadow-sm" :class="{ 'cursor-pointer': savedTasks?.id }">
    <div class="d-flex align-items-center justify-content-between">
      <label for="name" class="form-text" hidden>Task Name</label>
      <input
        id="name"
        type="text"
        @click.stop
        class="form-control-plaintext text-capitalize fs-4"
        v-model="taskCopy.name"
        placeholder="Task Title"
      />
      <TrashIcon
        class="text-danger float-end"
        style="width: 1.5rem; height: 1.5rem; cursor: pointer"
        @click.stop
        @click="removeTask"
      />
    </div>

    <div class="dropdown mb-2">
      <span
        class="badge border border-1 mb-2 me-3"
        :class="{
          'bg-warning-subtle text-warning': taskCopy.status === 'To-Do',
          'bg-info-subtle text-info': taskCopy.status === 'Ongoing',
          'bg-success-subtle text-success': taskCopy.status === 'Done',
        }"
        @click.stop
        @click="showMenu = !showMenu"
      >
        {{ taskCopy.status }}
      </span>
      <ul
        class="dropdown-menu show"
        v-if="showMenu"
        style="display: block; position: absolute"
        @click.stop
      >
        <li
          v-for="(status, index) in statusList"
          :key="index"
          class="dropdown-item"
          @click="setStatus(status)"
          style="cursor: pointer"
        >
          {{ status }}
        </li>
      </ul>
    </div>

    <div class="mb-2">
      <label for="description" class="form-text" hidden>Description</label>
      <input
        class="form-control-plaintext mb-2"
        v-model="taskCopy.description"
        placeholder="Task Description"
        @click.stop
      />
    </div>

    <div class="mb-2">
      <label for="assignee" class="form-text">Assignee</label>
      <select id="assignee" class="form-select" v-model="taskCopy.assignee" @click.stop>
        <option v-if="!taskCopy.assignee" :value="null" hidden>Unassigned</option>
        <option
          v-for="member in (taskCopy.board as Board).members"
          :key="member.id"
          :value="member"
          @click.stop
        >
          {{ member.name }} (@{{ member.username }})
        </option>
      </select>
    </div>

    <small :class="{ 'text-muted': isSaving, 'text-white': !isSaving }">{{
      isSaving ? 'Saving changes..' : 'Saved!'
    }}</small>
  </form>
</template>
