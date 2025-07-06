import type { ModelsCitizenWallet } from '@/http/models'

/**
 * Checks if any wallet cards have data to display and returns count
 * @param walletData - Wallet data from API
 * @param maintenanceRequestsTotal - Total number of maintenance requests
 * @returns Object with hasData boolean and count of available cards
 */
export function getWalletDataInfo(
  walletData?: ModelsCitizenWallet,
  maintenanceRequestsTotal = 0
) {
  const availableCards = [
    walletData?.saude?.clinica_familia?.nome,
    walletData?.educacao?.escola?.nome,
    walletData?.assistencia_social?.cras?.nome,
    maintenanceRequestsTotal > 0,
  ].filter(Boolean)

  return {
    hasData: availableCards.length > 0,
    count: availableCards.length,
  }
}
