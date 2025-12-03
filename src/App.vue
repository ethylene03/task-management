<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <nav-bar />
  <div class="container flex-fill d-flex flex-column h-100">
    <router-view />
  </div>
</template>

<style scoped></style>
