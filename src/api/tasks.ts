import type { ApiError } from '@/models/error'
import type { Task } from '@/models/tasks'
import { fetchApi, POST, PUT, DELETE, GET } from './base'

async function addTask(task: Task, signal: AbortSignal): Promise<Task | ApiError> {
  try {
    const response = await fetchApi(POST('/tasks', task, signal))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Task
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function getTasks(): Promise<Task[] | ApiError> {
  try {
    const response = await fetchApi(GET('/tasks'))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Task[]
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function getTask(id: string): Promise<Task | ApiError> {
  try {
    const response = await fetchApi(GET(`/tasks/${id}`))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Task
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function updateTask(task: Task, signal: AbortSignal): Promise<Task | ApiError> {
  try {
    const response = await fetchApi(PUT(`/tasks/${task.id}`, task, signal))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Task
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function deleteTask(id: string): Promise<void | ApiError> {
  try {
    const response = await fetchApi(DELETE(`/tasks/${id}`))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

export { addTask, getTasks, getTask, updateTask, deleteTask }
