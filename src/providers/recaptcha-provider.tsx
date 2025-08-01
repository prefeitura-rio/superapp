'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface RecaptchaContextType {
  recaptchaToken: string | null
  setRecaptchaToken: (token: string | null) => void
  isVerified: boolean
}

const RecaptchaContext = createContext<RecaptchaContextType | undefined>(
  undefined
)

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Check if user is authenticated (you can modify this logic)
  const isAuthenticated = false // This should be replaced with your auth logic

  useEffect(() => {
    // If user is authenticated, mark as verified
    if (isAuthenticated) {
      setIsVerified(true)
    }
  }, [])

  const handleSetRecaptchaToken = (token: string | null) => {
    setRecaptchaToken(token)
    if (token) {
      setIsVerified(true)
    }
  }

  return (
    <RecaptchaContext.Provider
      value={{
        recaptchaToken,
        setRecaptchaToken: handleSetRecaptchaToken,
        isVerified,
      }}
    >
      {children}
    </RecaptchaContext.Provider>
  )
}

export function useRecaptcha() {
  const context = useContext(RecaptchaContext)
  if (context === undefined) {
    throw new Error('useRecaptcha must be used within a RecaptchaProvider')
  }
  return context
}
