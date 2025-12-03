import type { Task } from './tasks'
import type { User } from './users'

export interface Board {
  id?: string
  name: string
  description?: string
  owner: User
  tasks: Task[]
  members: User[]
}
