import { getBoard } from '@/api/boards'
import {
  subscribeToBoard,
  subscribeToTask,
  unsubscribeFromBoard,
  unsubscribeFromTask,
} from '@/api/websocket'
import type { Board } from '@/models/boards'
import type { Comment } from '@/models/comments'
import type { ApiError, Broadcast } from '@/models/global'
import type { Task, TaskWithBoard } from '@/models/tasks'
import { useAuthorizationStore } from '@/stores/authorization'
import { useDataStore } from '@/stores/data'

function isError(obj: object): obj is ApiError {
  return Array.isArray((obj as ApiError)?.error)
}

function debounce(fun: () => void, delay = 300): () => void {
  let timer: ReturnType<typeof setTimeout>

  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => fun(), delay)
  }
}

function filterBoard(message: Broadcast): Board[] {
  const dataStore = useDataStore()
  let boards = dataStore.boards

  switch (message.type) {
    case 'create:board': {
      const data = message.data as Board
      if (!boards.find((b) => b.id === data.id)) {
        boards = [...boards, data]
        subscribeToBoard(data.id!)
      }
      break
    }

    case 'delete:board': {
      const id = message.data as string
      boards = boards.filter((b) => b.id !== id)
      unsubscribeFromBoard(id)
      break
    }

    case 'update:board': {
      const data = message.data as Board
      boards = boards.map((b) => (b.id === data.id ? data : b))
      break
    }

    case 'invite:board': {
      const data = message.data as Board
      if (!boards.find((b) => b.id === data.id)) {
        boards = [...boards, data]
        subscribeToBoard(data.id!)
      }
      break
    }
  }

  dataStore.boards = boards
  return boards
}

async function filterTask(message: Broadcast): Promise<TaskWithBoard[]> {
  const dataStore = useDataStore()
  const auth = useAuthorizationStore()
  let tasks = dataStore.tasks

  switch (message.type) {
    case 'create:task': {
      const data = message.data as Task
      const board = await getBoard(data.board)
      const dataWithBoard: TaskWithBoard = {
        ...data,
        board: isError(board) ? ({} as Board) : board,
      }

      if (data.assignee && data.assignee.id !== auth.id) break

      if (!tasks.find((t) => t.id === data.id)) {
        tasks = [...tasks, dataWithBoard]
        subscribeToTask(data.id!)
      }
      break
    }

    case 'delete:task': {
      const id = message.data as string
      tasks = tasks.filter((t) => t.id !== id)
      unsubscribeFromTask(id)
      break
    }

    case 'update:task': {
      const data = message.data as Task
      const board = await getBoard(data.board)
      const dataWithBoard: TaskWithBoard = {
        ...data,
        board: isError(board) ? ({} as Board) : board,
      }

      if (data.assignee && data.assignee.id !== auth.id) {
        tasks = tasks.filter((t) => t.id !== data.id)
        unsubscribeFromTask(data.id!)
        break
      }

      if (!tasks.find((t) => t.id === data.id)) {
        tasks = [...tasks, dataWithBoard]
        subscribeToTask(data.id!)
      } else tasks = tasks.map((t) => (t.id === data.id ? dataWithBoard : t))
      break
    }
  }

  dataStore.tasks = tasks
  return tasks
}

function filterComment(comments: Comment[], message: Broadcast): Comment[] {
  if (message.type === 'create:comment') {
    const data = message.data as Comment
    if (!comments.find((c) => c.id === data.id)) return [...comments, data]
  }
  return comments
}

export { isError, debounce, filterBoard, filterTask, filterComment }
