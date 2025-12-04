<script setup lang="ts">
import { deleteBoard, getBoard, inviteMember, updateBoard } from '@/api/boards'
import { getUsers } from '@/api/users'
import NoData from '@/components/NoData.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import { debounce, isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { Task } from '@/models/tasks'
import type { User } from '@/models/users'
import { TrashIcon } from '@heroicons/vue/24/solid'
import { Modal } from 'bootstrap'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

onMounted(() => {
  fetchBoard()
  fetchUsers()
  debouncedSave.value = debounce(submitBoard, 500)
})

const users = ref<User[]>([])
const showMenu = ref(false)
async function fetchUsers() {
  const response = await getUsers()
  if (isError(response)) return

  users.value = response
}

async function addMember(user: User) {
  const response = await inviteMember(board.value.id!, [user])
  if (isError(response)) return

  showMenu.value = false
  router.go(0)
}

const route = useRoute()
const router = useRouter()
const board = ref<Board>({} as Board)
const tasks = ref<Task[]>([])

async function fetchBoard() {
  const boardId = route.params.id as string
  const response = await getBoard(boardId)

  if (isError(response)) return

  board.value = response
  tasks.value.push(...(response.tasks || []))
}

const debouncedSave = ref<(() => void) | null>(null)
const saveController = ref<AbortController | null>(null)
async function submitBoard() {
  if (saveController.value) saveController.value.abort()
  saveController.value = new AbortController()

  const response = await updateBoard(board.value, saveController.value?.signal)
  if (isError(response)) return

  isSaving.value = false
}

const isSaving = ref(false)
watch(
  () => board.value,
  () => {
    isSaving.value = true
    if (debouncedSave.value) {
      debouncedSave.value?.()
    }
  },
  { deep: true },
)

async function removeBoard() {
  await deleteBoard(board.value.id!)

  router.back()
}

function addTask() {
  tasks.value.push({ name: '', status: 'To-Do', board: board.value.id!, comments: [] })
}

function removeTask(task: Task, index: number) {
  console.log(task, index)
  tasks.value = tasks.value.filter((_, i) => i !== index)
}

function viewTask(taskId?: string) {
  if (!taskId) return
  const modal = document.getElementById('modal--view-' + taskId)
  if (modal) {
    const modalInstance = new Modal(modal as HTMLElement)
    modalInstance.show()
  } else {
    console.error('Modal not found for task ID:', taskId)
  }
}
</script>

<template>
  <section id="board--view" class="section align-items-start">

    <div id="view-board--header" class="d-flex gap-3 w-100 align-items-center">
      <div id="view-board--title" class="flex-fill">
        <label for="name" hidden>Name</label>
        <input
          type="text"
          id="name"
          class="form-control-plaintext fs-3 fw-bold"
          v-model="board.name"
        />
      </div>
      <TrashIcon class="text-danger ms-3" style="width: 1.5rem; height: 1.5rem; cursor: pointer" @click="removeBoard" />
    </div>

    <div id="view-board--description" class="w-100">
      <label for="description"><small>Description</small></label>
      <textarea
        id="description"
        class="form-control bg-light border-dark"
        rows="4"
        style="resize: none; scroll-behavior: smooth"
        v-model="board.description"
        placeholder="Enter description here..."
      ></textarea>
    </div>

    <small v-if="board.members?.length === 0" class="text-muted">-- No members assigned yet. --</small>
    <div id="view-board--members" v-else class="mt-3">
      <p>Members:</p>
      <span
        v-for="member in board.members"
        :key="member.id"
        class="badge text-primary fs-6 me-2"
        :class="{
          'bg-info-subtle': member.id === board.owner.id,
          'bg-primary-subtle fw-normal': member.id !== board.owner.id,
        }"
      >
        {{ member.name }} (@{{ member.username }})
      </span>
    </div>

    <div id="view-board--buttons" class="d-flex flex-wrap gap-3 mt-4">
      <div id="view-board--add-member" class="dropdown">
        <button
          class="btn btn-outline-primary px-3"
          @click="showMenu = !showMenu"
        >
          Add Members
        </button>
        <ul class="dropdown-menu show" v-if="showMenu" style="display:block; position:absolute;">
          <li
            v-for="user in users"
            :key="user.id"
            class="dropdown-item"
            @click="addMember(user)"
            style="cursor: pointer;"
          >
            {{ user.username }}
          </li>
        </ul>
      </div>

      <button id="view-board--add-task" class="btn btn-primary px-3" @click="addTask">Add New Task</button>
    </div>

    <small: class="mt-3" :class="{ 'text-muted': isSaving, 'text-white': !isSaving }">{{
      isSaving ? 'Saving changes..' : 'Saved!'
    }}</small:>

    <div id="view-board--task" class="card w-100 p-2 p-md-5" style="max-height: 500px; overflow-y: auto">
      <NoData v-if="tasks.length === 0" message="You have no tasks yet." />

      <div v-else class="d-flex flex-wrap gap-3 justify-content-between">
        <div v-for="(task, index) in tasks" :key="task.id" class="flex-fill">
          <TaskCard
            :task="task"
            :board="board"
            @delete="removeTask(task, index)"
            @click="viewTask(task.id)"
          />
          <TaskModal :taskId="task.id" />
        </div>
      </div>
    </div>
  </section>
</template>
