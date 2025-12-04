<script setup lang="ts">
import { deleteBoard, getBoard, inviteMember, updateBoard } from '@/api/boards'
import { getUsers } from '@/api/users'
import NoData from '@/components/NoData.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import { debounce, filterBoard, isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { Broadcast } from '@/models/global'
import type { Task } from '@/models/tasks'
import type { User } from '@/models/users'
import { useAuthorizationStore } from '@/stores/authorization'
import { useSocketStore } from '@/stores/socket'
import { TrashIcon } from '@heroicons/vue/24/solid'
import { Modal } from 'bootstrap'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const isInitialLoad = ref(true)

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

const fromSocket = ref(false)
const socket = useSocketStore()
watch(
  () => socket.messages.length,
  () => {
    console.log("triggered")
    socket.messages.forEach(async (message: Broadcast) => {
      if (message.type.includes('board')) {
        const boards = filterBoard(message)
        if(boards.find(b => b.id === board.value.id)) {
          fromSocket.value = true;
          board.value = boards.find(b => b.id === board.value.id)!;

          setTimeout(() => {
            console.log('reset fromSocket');
            fromSocket.value = false;
          }, 50);
        } else router.back()
      }
    })
  },
  { deep: true },
)

const debouncedSave = ref<(() => void) | null>(null)
const saveController = ref<AbortController | null>(null)
async function submitBoard() {
  if (saveController.value) saveController.value.abort()
  saveController.value = new AbortController()

  await updateBoard(board.value, saveController.value?.signal)
  isSaving.value = false
}

const isSaving = ref(false)
watch(
  () => board.value,
  () => {
    console.log(fromSocket.value);
    if(fromSocket.value) return;
    if (isInitialLoad.value) {
      isInitialLoad.value = false;
      return;
    }

    isSaving.value = true
    debouncedSave.value?.()
  },
  { deep: true },
)

const auth = useAuthorizationStore()

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
      <TrashIcon v-if="board.owner?.id === auth.id" class="text-danger ms-3" style="width: 1.5rem; height: 1.5rem; cursor: pointer" @click="removeBoard" />
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
        :readonly="board.owner?.id !== auth.id"
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
