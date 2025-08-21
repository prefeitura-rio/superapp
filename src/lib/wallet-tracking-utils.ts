import type { ModelsCitizenWallet } from '@/http/models'
import { sendGAEvent } from '@next/third-parties/google'

/**
 * Helper function to get card position based on available cards
 * The position is calculated dynamically based on which cards exist
 */
export function getCardPosition(
  cardType: string,
  walletData?: ModelsCitizenWallet,
  maintenanceStats?: { total: number }
): number {
  let position = 1

  if (walletData?.saude?.clinica_familia) {
    if (cardType === 'clinica-da-familia') return position
    position++
  }

  if (walletData?.educacao?.escola?.nome) {
    if (cardType === 'escola-de-jovens-e-adultos') return position
    position++
  }

  if (walletData?.assistencia_social?.cras?.nome) {
    if (cardType === 'cadunico') return position
    position++
  }

  if (maintenanceStats?.total && maintenanceStats.total > 0) {
    if (cardType === 'cuidados-com-a-cidade') return position
    position++
  }

  return position
}

/**
 * Helper function to send GA event for wallet card clicks
 * Sends standardized event with title, name, position and timestamp
 */
export function sendWalletCardGAEvent(
  title: string,
  name: string,
  position: number
) {
  sendGAEvent('event', 'wallet_card_click', {
    title,
    name,
    position: position,
    event_timestamp: new Date().toISOString(),
  })
}

/**
 * Card types for wallet tracking
 */
export const WALLET_CARD_TYPES = {
  HEALTH: 'clinica-da-familia',
  EDUCATION: 'escola-de-jovens-e-adultos',
  SOCIAL: 'cadunico',
  CARETAKER: 'cuidados-com-a-cidade',
} as const

export type WalletCardType =
  (typeof WALLET_CARD_TYPES)[keyof typeof WALLET_CARD_TYPES]
