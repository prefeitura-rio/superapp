import type { ModelsCitizenWallet } from '@/http/models'

/**
 * Checks if any wallet cards have data to display
 * @param walletData - Wallet data from API
 * @param maintenanceRequestsTotal - Total number of maintenance requests
 * @returns Boolean indicating if any wallet cards have data
 */
export function hasWalletData(
  walletData?: ModelsCitizenWallet,
  maintenanceRequestsTotal = 0
) {
  return (
    walletData?.saude?.clinica_familia?.nome ||
    walletData?.educacao?.escola?.nome ||
    walletData?.assistencia_social?.cras?.nome ||
    maintenanceRequestsTotal > 0
  )
}
