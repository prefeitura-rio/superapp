import { suggestEmailDomain } from '@/lib/similarity/email-suggestion'
import { useCallback, useEffect, useState } from 'react'

interface EmailSuggestion {
  confidence: number
  suggestedDomain: string
  suggestedEmail: string
}

interface UseEmailSuggestionReturn {
  suggestion: EmailSuggestion | null
  acceptSuggestion: () => void
  clearSuggestion: () => void
}

export function useEmailSuggestion(
  email: string,
  onEmailChange: (newEmail: string) => void,
  debounceMs = 0
): UseEmailSuggestionReturn {
  const [suggestion, setSuggestion] = useState<EmailSuggestion | null>(null)

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setSuggestion(null)
      return
    }

    const timeoutId = setTimeout(() => {
      const result = suggestEmailDomain(email)
      setSuggestion(result)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [email, debounceMs])

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
      onEmailChange(suggestion.suggestedEmail)
      setSuggestion(null)
    }
  }, [suggestion, onEmailChange])

  const clearSuggestion = useCallback(() => {
    setSuggestion(null)
  }, [])

  return {
    suggestion,
    acceptSuggestion,
    clearSuggestion,
  }
}
