import type { ApiError } from '@/models/error'
import type { User } from '@/models/users'
import { DELETE, fetchApi, GET, POST, PUT } from './base'

async function createUser(user: User): Promise<User | ApiError> {
  try {
    const response = await fetchApi(POST('/users', user))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as User
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function getUsers(): Promise<User[] | ApiError> {
  try {
    const response = await fetchApi(GET('/users'))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as User[]
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function getUser(id: string): Promise<User | ApiError> {
  try {
    const response = await fetchApi(GET(`/users/${id}`))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as User
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function updateUser(user: User): Promise<User | ApiError> {
  try {
    const response = await fetchApi(PUT(`/users/${user.id}`, user))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as User
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function deleteUser(id: string): Promise<void | ApiError> {
  try {
    const response = await fetchApi(DELETE(`/users/${id}`))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

export { createUser, getUsers, getUser, updateUser, deleteUser }
