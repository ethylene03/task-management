import type { Board } from '@/models/boards'
import type { ApiError } from '@/models/global'
import type { User } from '@/models/users'
import { DELETE, fetchApi, GET, POST, PUT } from './base'
import type { ApiError } from '@/models/error'
import type { User } from '@/models/users'

async function addBoard(board: Board): Promise<Board | ApiError> {
  try {
    const response = await fetchApi(POST('/boards', board))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Board
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function getBoards(): Promise<Board[] | ApiError> {
  try {
    const response = await fetchApi(GET('/boards'))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Board[]
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function getBoard(id: string): Promise<Board | ApiError> {
  try {
    const response = await fetchApi(GET(`/boards/${id}`))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Board
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function updateBoard(board: Board, signal?: AbortSignal): Promise<Board | ApiError> {
  try {
    const response = await fetchApi(PUT(`/boards/${board.id}`, board, signal))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Board
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function inviteMember(boardId: string, members: User[]): Promise<Board | ApiError> {
  try {
    const response = await fetchApi(PUT(`/boards/${boardId}/members`, members))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Board
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function deleteBoard(id: string): Promise<void | ApiError> {
  try {
    const response = await fetchApi(DELETE(`/boards/${id}`))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

export { addBoard, getBoards, getBoard, updateBoard, inviteMember, deleteBoard }
