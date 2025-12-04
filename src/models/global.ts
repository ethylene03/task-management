import type { Board } from './boards'
import type { Comment } from './comments'
import type { Task } from './tasks'

export interface ApiError {
  error: string[]
}

export interface Broadcast {
  type: string
  data: string | Task | Board | Comment
}
