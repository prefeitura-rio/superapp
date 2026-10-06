import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'
import { WalletPageClient } from '@/app/components/wallet-page-client'

export default function Wallet() {
  return (
    <div className="text-white">
      <ProfileHeaderWrapper />
      <main className="w-full max-w-4xl mx-auto">
        <WalletPageClient />
        <FloatNavigationWrapper />
      </main>
    </div>
  )
}
