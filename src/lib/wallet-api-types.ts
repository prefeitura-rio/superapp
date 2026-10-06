import type {
  ModelsCitizenWallet,
  ModelsMaintenanceRequest,
  ModelsPet,
} from '@/http/models'
import type { HealthUnitInfo, HealthUnitRisk } from '@/lib/health-unit'

/** Shape returned by GET /api/user/wallet */
export interface WalletApiResponse {
  walletData?: ModelsCitizenWallet | null
  maintenanceRequests?: ModelsMaintenanceRequest[] | null
  healthUnitData?: HealthUnitInfo | null
  healthUnitRiskData?: HealthUnitRisk | null
  pets?: ModelsPet[]
  error?: string
}
