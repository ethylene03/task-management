<script setup lang="ts">
import { login } from '@/api/authorization'
import { isError } from '@/helpers/utils'
import { useAuthorizationStore } from '@/stores/authorization'
import { useSocketStore } from '@/stores/socket'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const credentials = {
  username: '',
  password: '',
}

const errorMessage = ref<string>('')
const router = useRouter()

async function handleLogin() {
  const response = await login(credentials)

  if (isError(response)) {
    errorMessage.value = response.error.join(', ')
    return
  }

  const auth = useAuthorizationStore()
  const socket = useSocketStore()
  auth.setToken(response.token)
  auth.setUserDetails(response)
  socket.connect()

  router.push({ name: 'Home' })
}
</script>

<template>
  <section
    id="login"
    class="d-flex flex-column justify-content-center align-items-center flex-fill"
  >
    <div class="card p-4 shadow" style="min-width: 22rem">
      <h2 class="card-title text-center mb-4">Log In</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input
            type="username"
            class="form-control"
            id="username"
            placeholder="Enter username"
            v-model="credentials.username"
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="Enter Password"
            v-model="credentials.password"
          />
        </div>
        <div class="mb-3 text-danger" v-if="errorMessage">{{ errorMessage }}</div>
        <button type="submit" class="btn btn-primary w-100 mt-4">Log In</button>
      </form>
    </div>
  </section>
</template>
