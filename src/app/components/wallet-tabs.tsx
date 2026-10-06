'use client'

import { SliderTabs } from '@/app/components/slider-tabs'
import { isFeatureEnabled } from '@/lib/feature-flags'

interface WalletTabsProps {
  activeTab: 'cards' | 'pets' | 'cadmicro'
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
    id: 'cadmicro',
    label: 'Veículos',
    href: '/carteira?mobilidade=true',
  },
]

export function WalletTabs({ activeTab }: WalletTabsProps) {
  const tabs = isFeatureEnabled('cadmicro')
    ? WALLET_TABS
    : WALLET_TABS.filter(tab => tab.id !== 'cadmicro')

  return <SliderTabs tabs={tabs} activeTabId={activeTab} />
}
