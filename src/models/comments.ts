import type { User } from "./users"

export interface Comment {
  id?: string
  user: User
  comment: string
  task: string
}
