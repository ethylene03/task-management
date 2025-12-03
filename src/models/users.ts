export interface UserToken {
  id: string
  name: string
  username: string
  token: string
}

export type User = Omit<UserToken, 'token'>
export type UserProfile = Partial<UserCredentials> & { newPassword?: string }

export type UserPasswordChange = {
  username: string
  oldPassword: string
  newPassword: string
}

export interface UserCredentials {
  name?: string
  username: string
  password: string
}

export interface UserList {
  total: number
  pages: number
  page: number
  size: number
  data: User[]
}
