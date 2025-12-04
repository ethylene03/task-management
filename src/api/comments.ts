import type { Comment } from '@/models/comments'
import type { ApiError } from '@/models/global'
import { fetchApi, POST } from './base'

async function addComment(comment: Comment): Promise<Comment | ApiError> {
  try {
    const response = await fetchApi(POST('/comments', comment))
    const data = await response.json()

    if (!response.ok) return { error: data.error } as ApiError

    return data as Comment
  } catch (error) {
    if (error instanceof TypeError) return { error: ['Network/Fetch error'] } as ApiError

    return { error: ['Unknown error'] } as ApiError
  }
}

export { addComment }
