import type { ApiError } from '@/models/error'

function isError(obj: object): obj is ApiError {
  return Array.isArray((obj as ApiError)?.error)
}

function debounce(fun: () => void, delay = 300): () => void {
  let timer: ReturnType<typeof setTimeout>

  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => fun(), delay)
  }
}

export { isError, debounce }
