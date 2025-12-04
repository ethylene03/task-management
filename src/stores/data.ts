import type { Board } from '@/models/boards'
import type { TaskWithBoard } from '@/models/tasks'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
  state: () => ({
    boards: [] as Board[],
    tasks: [] as TaskWithBoard[],
  }),
})
