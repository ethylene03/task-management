<script setup lang="ts">
import BoardsDisplay from '@/components/BoardsDisplay.vue'
import TasksDisplay from '@/components/TasksDisplay.vue'
import type { User } from '@/models/users'
import { useAuthorizationStore } from '@/stores/authorization'
import { onMounted, ref } from 'vue'

onMounted(() => {
  fetchUser()
})

const user = ref<User>({} as User)
function fetchUser() {
  const auth = useAuthorizationStore()
  user.value = auth.getUserDetails()
}
</script>

<template>
  <section id="home" class="section" style="height: 100%">
    <h2 class="my-4">Welcome, {{ user.name }}!</h2>
    <p class="text-center text-md-start">
      Manage your tasks, create boards, and invite other users here.
    </p>

    <div class="mt-5 w-100 flex-fill d-flex flex-column flex-md-row justify-content-between gap-5">
      <boards-display />
      <tasks-display />
    </div>
  </section>
</template>
