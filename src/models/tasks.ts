import type { Board } from './boards'
import type { Comment } from './comments'
import type { User } from './users'

export interface Task {
  id?: string
  status: 'To-Do' | 'Ongoing' | 'Done'
  name: string
  description?: string
  board: string
  assignee?: User
  comments: Comment[]
}

export type TaskWithBoard = Omit<Task, 'board'> & { board: Board }
