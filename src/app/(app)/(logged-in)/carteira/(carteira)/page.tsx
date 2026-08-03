import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { WalletPageClient } from '@/app/components/wallet-page-client'

export default function Wallet() {
  return (
    <main className="min-h-lvh max-w-xl md:max-w-4xl mx-auto text-white">
      <WalletPageClient />
      <FloatNavigationWrapper />
    </main>
  )
}
