<script setup lang="ts">
const { message } = defineProps<{ message: string }>()
</script>

<template>
  <div class="text-center">
    <img src="@/helpers/no-data.avif" alt="No Tasks" class="mb-4" style="max-width: 300px" />
    <p class="mb-3">{{ message }}</p>
  </div>
</template>
