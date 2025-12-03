<script setup lang="ts">
import { getBoard } from '@/api/boards'
import { addComment } from '@/api/comments'
import { getTask } from '@/api/tasks'
import { isError } from '@/helpers/utils'
import type { Comment } from '@/models/comments'
import type { TaskWithBoard } from '@/models/tasks'
import type { User } from '@/models/users'
import { useAuthorizationStore } from '@/stores/authorization'
import { UserCircleIcon } from '@heroicons/vue/24/solid'
import { onMounted, ref } from 'vue'

onMounted(() => {
  fetchUser()
  fetchTask()
})

const { taskId } = defineProps<{ taskId?: string }>()
const comment = ref<string>('')
const user = ref<User>({} as User)

function fetchUser() {
  const auth = useAuthorizationStore()
  user.value = auth.getUserDetails()
}

const task = ref<TaskWithBoard>({} as TaskWithBoard)
async function fetchTask() {
  const response = await getTask(taskId || '')
  if (isError(response)) return

  const board = await getBoard(response.board as string)
  if (isError(board)) return

  task.value = { ...response, board: board }
}

async function submitComment() {
  if (!comment.value.trim()) return
  const newComment = {
    user: user.value,
    comment: comment.value.trim(),
    task: task.value.id || '',
  } as Comment

  await addComment(newComment)

  task.value.comments.push(newComment)

  comment.value = ''
}
</script>

<template>
  <div class="modal fade" :id="'modal--view-' + task.id" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-bottom-0 px-4">
          <div>
            <h1 class="modal-title fs-5">{{ task.name }}</h1>
            <small class="text-muted">{{ task.board?.name }}</small>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body py-4">
          <div class="mb-3">
            <small class="text-muted">Description</small>
            <p class="card w-100 px-3 py-2" style="height: 10rem; overflow-y: auto">
              {{ task.description || 'No Description' }}
            </p>
          </div>

          <div class="mb-3 mt-5">
            <div class="mb-3 d-flex flex-row gap-3 align-items-end">
              <UserCircleIcon style="width: 2.25rem; height: 2.25rem" />
              <div class="flex-fill">
                <small for="comment" class="form-label">{{ user.name }}</small>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Add a comment..."
                  @keydown.enter.prevent="submitComment"
                  v-model="comment"
                />
              </div>
            </div>

            <div
              class="card p-3 d-flex flex-column gap-3"
              style="max-height: 400px; overflow-y: auto"
            >
              <small class="text-muted">Comments</small>
              <span v-if="task.comments?.length === 0" class="text-muted text-center">
                No comments yet.
              </span>
              <div
                v-else
                v-for="comm in task.comments"
                :key="comm.id"
                class="d-flex flex-row gap-3"
              >
                <UserCircleIcon style="width: 2.25rem; height: 2.25rem" />
                <div class="w-100 card px-3 py-2 bg-secondary-subtle">
                  <small class="text-muted fw-bold">{{ comm.user.name }}</small>
                  <p class="mb-0 fw-light">{{ comm.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
