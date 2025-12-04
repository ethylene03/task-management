import type { Broadcast } from '@/models/global'
import { useAuthorizationStore } from '@/stores/authorization'
import { useSocketStore } from '@/stores/socket'
import { Client } from '@stomp/stompjs'

let client: Client | null = null
const baseUrl = 'ws://localhost:8080'

export function connectSocket(onMessageCallback: (msg: Broadcast) => void): void {
  const auth = useAuthorizationStore()
  const token = auth.token
  const userId = auth.id

  client = new Client({
    brokerURL: baseUrl + '/ws',
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      client?.subscribe(`/topic/users/${userId}`, (message) =>
        onMessageCallback(JSON.parse(message.body)),
      )
    },
    onStompError: (frame) => {
      console.error('Broker reported error:', frame.headers.message, frame.body)
    },
  })

  client.activate()
}

export function disconnectSocket(): void {
  client?.deactivate()
}

export function subscribeToBoard(boardId: string) {
  const socket = useSocketStore()
  if (socket.boardSubscription.find((b) => b.boardId === boardId)) return

  const subscription = client?.subscribe(`/topic/boards/${boardId}`, (msg) => {
    socket.messages.push(JSON.parse(msg.body))
  })

  if (subscription) socket.boardSubscription.push({ boardId, subscription })
}

export function subscribeToTask(taskId: string) {
  const socket = useSocketStore()
  if (socket.taskSubscription.find((t) => t.taskId === taskId)) return

  const subscription = client?.subscribe(`/topic/tasks/${taskId}`, (msg) => {
    socket.messages.push(JSON.parse(msg.body))
  })

  if (subscription) socket.taskSubscription.push({ taskId, subscription })
}

export function unsubscribeFromBoard(boardId: string) {
  const socket = useSocketStore()
  if (!socket.boardSubscription.find((b) => b.boardId === boardId)) return

  const index = socket.boardSubscription.findIndex((b) => b.boardId === boardId)
  if (index !== -1) {
    socket.boardSubscription[index]?.subscription.unsubscribe()
    socket.boardSubscription.splice(index, 1)
  }
}

export function unsubscribeFromTask(taskId: string) {
  const socket = useSocketStore()
  if (!socket.taskSubscription.find((t) => t.taskId === taskId)) return

  const index = socket.taskSubscription.findIndex((t) => t.taskId === taskId)
  if (index !== -1) {
    socket.taskSubscription[index]?.subscription.unsubscribe()
    socket.taskSubscription.splice(index, 1)
  }
}
