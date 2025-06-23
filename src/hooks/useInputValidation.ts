import { useEffect, useState } from 'react'

type State = 'default' | 'success' | 'error'

interface UseInputValidationOptions {
  value: string
  validate: (value: string) => boolean
  debounceMs?: number
  minLength?: number
}

export function useInputValidation({
  value,
  validate,
  debounceMs = 800,
  minLength = 1,
}: UseInputValidationOptions) {
  const [inputState, setInputState] = useState<State>('default')

  useEffect(() => {
    if (value.length < minLength) {
      setInputState('default')
      return
    }

    const timeout = setTimeout(() => {
      setInputState(validate(value) ? 'success' : 'error')
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [value, validate, debounceMs, minLength])

  return inputState
}
