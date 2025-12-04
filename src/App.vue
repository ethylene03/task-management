<script setup lang="ts">
import { watch } from 'vue'
import NavBar from './components/NavBar.vue'
import { useDataStore } from './stores/data'
import { subscribeToBoard, subscribeToTask } from './api/websocket'

const dataStore = useDataStore()

watch(
  () => dataStore.boards,
  (boards) => {
    boards.forEach((board) => {
      subscribeToBoard(board.id!)
    })
  },
  { deep: true },
)

watch(
  () => dataStore.tasks,
  (tasks) => {
    tasks.forEach((task) => {
      subscribeToTask(task.id!)
    })
  },
  { deep: true },
)
</script>

<template>
  <nav-bar />
  <div class="container flex-fill d-flex flex-column h-100">
    <router-view />
  </div>
</template>

<style scoped></style>
