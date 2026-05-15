'use client'

import { setFirstLoginFalse } from '@/actions/first-login'
import { useEffect, useState } from 'react'
import Onboarding from './on-boarding'

export const ONBOARDING_SESSION_KEY = 'onboarding_done'

type UserInfo = { cpf: string; name: string }

type OnboardingStatus = {
  checked: boolean
  firstLogin: boolean
  userInfo: UserInfo | null
}

async function completeOnboarding(cpf: string) {
  const result = await setFirstLoginFalse(cpf)
  sessionStorage.setItem(ONBOARDING_SESSION_KEY, '1')
  return result
}

export function OnboardingWrapperClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [status, setStatus] = useState<OnboardingStatus>({
    checked: false,
    firstLogin: false,
    userInfo: null,
  })

  useEffect(() => {
    if (sessionStorage.getItem(ONBOARDING_SESSION_KEY) === '1') {
      setStatus({ checked: true, firstLogin: false, userInfo: null })
      return
    }

    fetch('/api/user/onboarding-status', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.firstLogin)
          sessionStorage.setItem(ONBOARDING_SESSION_KEY, '1')
        setStatus({
          checked: true,
          firstLogin: data.firstLogin,
          userInfo: data.userInfo,
        })
      })
      .catch(() =>
        setStatus({ checked: true, firstLogin: false, userInfo: null })
      )
  }, [])

  if (status.checked && status.firstLogin && status.userInfo) {
    return (
      <main className="flex max-w-[600px] mx-auto flex-col bg-background text-foreground">
        <Onboarding
          userInfo={status.userInfo}
          setFirstLoginFalse={completeOnboarding}
        />
      </main>
    )
  }

  return <>{children}</>
}
