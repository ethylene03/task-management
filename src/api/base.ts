import type { Board } from '@/models/boards'
import type { Comment } from '@/models/comments'
import type { Task } from '@/models/tasks'
import type { User } from '@/models/users'
import { useAuthorizationStore } from '@/stores/authorization'
import { refreshToken } from './authorization'

const baseUrl = import.meta.env.VITE_API_URL
type DataType = Board | Comment | Task | User[] | Record<string, string>

function getHeaders() {
  const auth = useAuthorizationStore()

  return new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth.token}`,
  })
}

function GET(url: string, query: Record<string, string> | null = null) {
  const params = query ? new URLSearchParams(query).toString() : null
  return new Request(baseUrl + url + (params ? '?' + params : ''), {
    method: 'GET',
    headers: getHeaders(),
  })
}

function POST(url: string, body: DataType, signal?: AbortSignal) {
  return new Request(baseUrl + url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
    signal,
  })
}

function PUT(url: string, body: DataType, signal?: AbortSignal) {
  return new Request(baseUrl + url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
    signal,
  })
}

function DELETE(url: string) {
  return new Request(baseUrl + url, {
    method: 'DELETE',
    headers: getHeaders(),
  })
}

async function fetchApi(request: Request): Promise<Response> {
  const response = await fetch(request)

  if (response.status === 403) {
    const auth = useAuthorizationStore()
    const newToken = await refreshToken()

    if (newToken) {
      auth.setToken(newToken.token)
      auth.setUserDetails(newToken)

      request.headers.set('Authorization', `Bearer ${newToken.token}`)
      return await fetch(request)
    }
  }

  return response
}

export { DELETE, fetchApi, GET, getHeaders, POST, PUT }
