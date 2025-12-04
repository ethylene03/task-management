import type { ApiError } from '@/models/global'
import type { User, UserCredentials, UserToken } from '@/models/users'

function getUrl(path: string = ''): string {
  return import.meta.env.VITE_API_URL + '/auth' + path
}

const headers = new Headers({ 'Content-Type': 'application/json' })

async function login(user: UserCredentials): Promise<UserToken | ApiError> {
  try {
    const response = await fetch(getUrl('/login'), {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(user),
    })

    if (!response.ok) return (await response.json()) as ApiError

    return (await response.json()) as UserToken
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function signup(user: UserCredentials): Promise<User | ApiError> {
  try {
    const response = await fetch(getUrl('/signup'), {
      method: 'POST',
      headers,
      body: JSON.stringify(user),
    })

    if (!response.ok) return (await response.json()) as ApiError

    return (await response.json()) as User
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

async function logout(): Promise<void> {
  try {
    const response = await fetch(getUrl(), {
      method: 'DELETE',
      credentials: 'include',
      headers,
    })

    if (!response.ok) throw new Error('Logout failed with status ' + response.status)
  } catch (error) {
    throw new Error('Error logging out user: ' + error)
  }
}

async function refreshToken(): Promise<UserToken | null> {
  try {
    const response = await fetch(getUrl('/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers,
    })

    if (!response.ok) return null

    return (await response.json()) as UserToken
  } catch (error) {
    throw new Error('Error refreshing token: ' + error)
  }
}

export { login, logout, refreshToken, signup }
