import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { WalletBreadcrumb } from '@/app/components/wallet-breadcrumb'
import { WalletPageClient } from '@/app/components/wallet-page-client'
import { Suspense } from 'react'

export default function Wallet() {
  return (
    <div className="text-white">
      <ProfileHeaderWrapper title="Documentos" />
      <Suspense>
        <WalletBreadcrumb />
      </Suspense>
      <div className="w-full max-w-4xl mx-auto">
        <WalletPageClient />
        <FloatNavigationWrapper />
      </div>
    </div>
  )
}
