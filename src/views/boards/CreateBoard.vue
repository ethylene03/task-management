<script setup lang="ts">
import { addBoard } from '@/api/boards'
import { getUsers } from '@/api/users'
import { isError } from '@/helpers/utils'
import type { Board } from '@/models/boards'
import type { User } from '@/models/users'
import { useAuthorizationStore } from '@/stores/authorization'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

onMounted(() => {
  setOwner()
  fetchUsers()
})

const users = ref<User[]>([])
async function fetchUsers() {
  const response = await getUsers()
  if (isError(response)) return

  users.value = response
}

const owner = ref<User>({} as User)
function setOwner() {
  const auth = useAuthorizationStore()
  owner.value = auth.getUserDetails()
}

const board = ref<Board>({} as Board)
const errorMessage = ref<string>('')
const router = useRouter()

async function createBoard() {
  errorMessage.value = ''
  if (!board.value.owner) {
    board.value.owner = owner.value
  }

  const response = await addBoard(board.value)
  if (isError(response)) {
    errorMessage.value = response.error.join(', ')
    return
  }

  router.back()
}
</script>

<template>
  <section id="board--create" class="section">
    <h2>Create New Board</h2>
    <p class="text-center text-md-start">Set up a new board to manage your tasks effectively.</p>
    <p class="text-danger" v-if="errorMessage">Error: {{ errorMessage }}</p>

    <form class="mt-2 w-100 card p-3 p-md-5" @submit.prevent="createBoard">
      <div class="mb-3">
        <label for="name" class="form-label">
          Board Name
          <span class="text-danger">*</span>
        </label>
        <input
          type="text"
          class="form-control"
          id="name"
          placeholder="Enter board name"
          v-model="board.name"
          required
        />
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea
          class="form-control"
          id="description"
          rows="3"
          placeholder="Enter board description"
          v-model="board.description"
          style="resize: none; scroll-behavior: smooth"
        ></textarea>
      </div>
      <div class="mb-3">
        <label for="owner" class="form-label">
          Board Owner
          <span class="text-danger">*</span>
        </label>
        <select class="form-select" id="owner" disabled required>
          <option
            v-for="user in users"
            :key="user.id"
            :value="user"
            :selected="user.id === owner.id"
          >
            <strong>{{ user.name }}</strong> (@{{ user.username }})
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="members" class="form-label">Members</label>
        <select class="form-select" id="members" v-model="board.members" multiple>
          <template v-for="user in users" :key="user.id">
            <option v-if="user.id !== owner.id" :value="user">
              <strong>{{ user.name }}</strong> (@{{ user.username }})
            </option>
          </template>
        </select>
        <span class="form-text"> You can add members after creating the board. </span>
        <br />
        <template v-for="member in board.members" :key="member.id">
          <span
            v-if="member.id !== owner.id"
            class="badge bg-primary-subtle text-primary fs-6 me-2 mt-2"
          >
            {{ member.name }} (@{{ member.username }})
          </span>
        </template>
      </div>
      <div class="mt-3 d-flex flex-wrap gap-3">
        <button type="button" class="btn flex-fill btn-outline-primary" @click="$router.back()">
          Cancel
        </button>
        <button type="submit" class="btn flex-fill btn-primary">Create Board</button>
      </div>
    </form>
  </section>
</template>
