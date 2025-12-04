<script setup lang="ts">
import type { Board } from '@/models/boards'

const { board } = defineProps<{ board: Board }>()
</script>

<template>
  <router-link
    :to="{ name: 'View Board', params: { id: board.id } }"
    class="text-decoration-none d-block flex-fill"
  >
    <div class="card h-100 shadow-sm">
      <div class="card-body">
        <h5 class="card-title text-primary">{{ board.name }}</h5>
        <p class="card-text text-truncate">
          {{ board.description }}
        </p>
        <div class="d-flex flex-column">
          <small class="text-secondary"> Members: {{ board.members?.length || 0 }} </small>
          <small class="text-secondary"> Tasks: {{ board.tasks.length }} </small>
        </div>
      </div>
    </div>
  </router-link>
</template>
