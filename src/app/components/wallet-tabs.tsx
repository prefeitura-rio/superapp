'use client'

import { SliderTabs } from '@/app/components/slider-tabs'

interface WalletTabsProps {
  activeTab: 'cards' | 'pets'
}

const WALLET_TABS = [
  {
    id: 'cards',
    label: 'Meus Cartões',
    href: '/carteira',
  },
  {
    id: 'pets',
    label: 'Meus Pets',
    href: '/carteira?pets=true',
  },
]

export function WalletTabs({ activeTab }: WalletTabsProps) {
  return <SliderTabs tabs={WALLET_TABS} activeTabId={activeTab} />
}
