'use client'

import { setFirstLoginFalse } from '@/actions/first-login'
import { useQuery } from '@tanstack/react-query'
import Onboarding from './on-boarding'

type UserInfo = { cpf: string; name: string }
type OnboardingStatusData = { firstLogin: boolean; userInfo: UserInfo | null }

async function fetchOnboardingStatus(): Promise<OnboardingStatusData> {
  const res = await fetch('/api/user/onboarding-status')
  if (!res.ok) return { firstLogin: false, userInfo: null }
  return res.json()
}

async function completeOnboarding(cpf: string) {
  return setFirstLoginFalse(cpf)
}

export function OnboardingWrapperClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: fetchOnboardingStatus,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading || !data?.firstLogin || !data?.userInfo) {
    return <>{children}</>
  }

  return (
    <main className="flex max-w-[600px] mx-auto flex-col bg-background text-foreground">
      <Onboarding
        userInfo={data.userInfo}
        setFirstLoginFalse={completeOnboarding}
      />
    </main>
  )
}
