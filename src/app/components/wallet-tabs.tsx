'use client'

import Link from 'next/link'

interface WalletTabsProps {
  activeTab: 'cards' | 'pets'
}

export function WalletTabs({ activeTab }: WalletTabsProps) {
  return (
    <div className="relative inline-flex bg-card rounded-full p-1 w-full justify-center h-[52px] items-center">
      {/* Background slider */}
      <div
        className="absolute top-1 bottom-1 bg-secondary rounded-full transition-all duration-300 ease-in-out shadow-sm"
        style={{
          left: activeTab === 'cards' ? '4px' : 'calc(50% + 2px)',
          width: 'calc(50% - 8px)',
        }}
      />

      <Link
        href="/carteira"
        className="relative z-10 flex-1 px-6 py-2 text-sm rounded-full transition-colors duration-300 text-center text-foreground"
      >
        Meus Cartões
      </Link>

      <Link
        href="/carteira?pets=true"
        className="relative z-10 flex-1 px-6 py-2 text-sm rounded-full transition-colors duration-300 text-center text-foreground"
      >
        Meus Pets
      </Link>
    </div>
  )
}
