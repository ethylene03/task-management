<script setup lang="ts">
import { logout } from '@/api/authorization'
import { useAuthorizationStore } from '@/stores/authorization'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()

async function logoutUser() {
  await logout()

  const auth = useAuthorizationStore()
  auth.clearToken()
  auth.clearUserDetails()

  router.push({ name: 'Login' })
}

const currentPath = computed(() => {
  return route.name?.toString().toLowerCase() || ''
})

const isOpen = ref<boolean>(false)

watch(
  () => route.path,
  () => {
    isOpen.value = false
  },
)
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm position-sticky top-0 z-1">
    <div class="container-fluid py-3 px-5">
      <h1 class="navbar-brand mb-0">Task Management</h1>
      <button
        class="navbar-toggler"
        type="button"
        aria-label="Toggle navigation"
        @click="isOpen = !isOpen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        id="navbarNav"
        :class="[{ collapse: !isOpen }, 'navbar-collapse', { show: isOpen }]"
        class="ms-3 justify-content-between"
      >
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/home">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/boards">Boards</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/tasks">Tasks</router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <button
              v-if="currentPath !== 'login' && currentPath !== 'signup'"
              class="nav-link"
              @click="logoutUser"
            >
              <arrow-right-start-on-rectangle-icon
                class="me-2"
                style="width: 1.25rem; height: 1.25rem"
              />
              Logout
            </button>
            <button
              v-if="currentPath === 'signup'"
              class="nav-link"
              @click="$router.push({ name: 'Login' })"
            >
              Login
            </button>
            <button
              v-if="currentPath === 'login'"
              class="nav-link"
              @click="$router.push({ name: 'Signup' })"
            >
              Signup
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  color: var(--bs-primary);
}
</style>
