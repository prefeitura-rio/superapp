'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'

/** Shows a deduped error toast when a TanStack Query fails. */
export function useRiomobQueryErrorToast(
  isError: boolean,
  message: string,
  toastId: string
) {
  useEffect(() => {
    if (!isError) return
    toast.error(message, { id: toastId })
  }, [isError, message, toastId])
}
