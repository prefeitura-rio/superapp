import { useCallback, useState } from 'react'

interface CopyToClipboardResult {
  /**
   * Function to copy text to clipboard
   * @param text - The text to copy
   * @returns Promise that resolves to true if successful, false otherwise
   */
  copy: (text: string) => Promise<boolean>

  /**
   * Indicates if the copy operation was successful
   */
  isCopied: boolean

  /**
   * Error message if the copy operation failed
   */
  error: string | null

  /**
   * Resets the copied state and error
   */
  reset: () => void
}

/**
 * Custom hook for copying text to clipboard with state management
 *
 * Features:
 * - Automatic state management (isCopied, error)
 * - Auto-reset after configurable timeout
 * - Fallback for older browsers
 * - TypeScript support
 *
 * @param resetTimeout - Time in milliseconds before auto-resetting the copied state (default: 2000ms)
 * @returns Object with copy function, isCopied state, error, and reset function
 */
export function useCopyToClipboard(resetTimeout = 2000): CopyToClipboardResult {
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Reset previous state
      setIsCopied(false)
      setError(null)

      // Check if text is valid
      if (!text || typeof text !== 'string') {
        setError('Invalid text to copy')
        return false
      }

      try {
        // Modern Clipboard API (preferred)
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          setIsCopied(true)

          // Auto-reset after timeout
          if (resetTimeout > 0) {
            setTimeout(() => {
              setIsCopied(false)
            }, resetTimeout)
          }

          return true
        }

        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (successful) {
          setIsCopied(true)

          // Auto-reset after timeout
          if (resetTimeout > 0) {
            setTimeout(() => {
              setIsCopied(false)
            }, resetTimeout)
          }

          return true
        }

        throw new Error('Copy command failed')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to copy to clipboard'
        setError(errorMessage)
        console.error('Copy to clipboard error:', err)
        return false
      }
    },
    [resetTimeout]
  )

  const reset = useCallback(() => {
    setIsCopied(false)
    setError(null)
  }, [])

  return {
    copy,
    isCopied,
    error,
    reset,
  }
}
