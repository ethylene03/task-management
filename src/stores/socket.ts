import { getBoards } from '@/api/boards'
import { connectSocket, disconnectSocket, subscribeToBoard, subscribeToTask } from '@/api/websocket'
import { isError } from '@/helpers/utils'
import type { Broadcast } from '@/models/global'
import { defineStore } from 'pinia'
import { useDataStore } from './data'
import { getTasks } from '@/api/tasks'
import type { Board } from '@/models/boards'
import type { StompSubscription } from '@stomp/stompjs'

export const useSocketStore = defineStore('socket', {
  state: () => ({
    messages: [] as Broadcast[],
    boardSubscription: [] as { boardId: string; subscription: StompSubscription }[],
    taskSubscription: [] as { taskId: string; subscription: StompSubscription }[],
    isConnected: false,
  }),

  actions: {
    connect() {
      if (this.isConnected) return

      connectSocket((msg: Broadcast) => {
        this.messages.push(msg)
      })

      this.subscribe()

      this.isConnected = true
    },

    async subscribe() {
      const dataStore = useDataStore()

      const boards = await getBoards()
      if (!isError(boards)) {
        dataStore.boards = boards

        boards.forEach((board) => {
          if (board.id && !this.boardSubscription.find((b) => b.boardId === board.id)) {
            subscribeToBoard(board.id)
          }
        })
      } else return

      const tasks = await getTasks()
      if (!isError(tasks)) {
        dataStore.tasks = tasks.map((task) => {
          return { ...task, board: boards.find((b) => b.id === task.board) || ({} as Board) }
        })

        tasks.forEach((task) => {
          if (task.id && !this.taskSubscription.find((t) => t.taskId === task.id)) {
            subscribeToTask(task.id)
          }
        })
      } else return
    },

    disconnect() {
      if (!this.isConnected) return

      disconnectSocket()
      this.isConnected = false
    },
  },
})
