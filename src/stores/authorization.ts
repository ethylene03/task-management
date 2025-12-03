import type { User, UserToken } from '@/models/users'
import { defineStore } from 'pinia'

export const useAuthorizationStore = defineStore('authorization', {
  state: () => ({
    token: '',
    id: '',
    name: '',
    username: '',
  }),
  actions: {
    setToken(newToken: string) {
      this.token = newToken
    },
    clearToken() {
      this.token = ''
    },
    isLoggedIn(): boolean {
      return this.token !== ''
    },
    setUserDetails(response: UserToken) {
      this.id = response.id
      this.name = response.name
      this.username = response.username
    },
    clearUserDetails() {
      this.id = ''
      this.name = ''
      this.username = ''
    },
    getUserDetails() {
      return { id: this.id, name: this.name, username: this.username } as User
    },
  },
})
