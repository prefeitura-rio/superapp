'use client'

import { SliderTabs } from '@/app/components/slider-tabs'

interface WalletTabsProps {
  activeTab: 'cards' | 'pets' | 'riomob'
}

const WALLET_TABS = [
  {
    id: 'cards',
    label: 'Cartões',
    href: '/carteira',
  },
  {
    id: 'pets',
    label: 'Pets',
    href: '/carteira?pets=true',
  },
  {
    id: 'riomob',
    label: 'Veículos',
    href: '/carteira?riomob=true',
  },
]

export function WalletTabs({ activeTab }: WalletTabsProps) {
  return <SliderTabs tabs={WALLET_TABS} activeTabId={activeTab} />
}
