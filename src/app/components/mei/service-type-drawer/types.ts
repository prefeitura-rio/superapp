import type { MeiCompanyStatus } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/mei/meu-mei/types'

export type ServiceTypeSheetType = 'info' | 'incompatible' | 'no-mei' | 'irregular'

export interface UserMeiContext {
  isLoggedIn: boolean
  hasMei: boolean
  situacaoCadastral?: MeiCompanyStatus
  userCnaes?: string[]
}

export interface ServiceTypeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityCnaeIds?: string[]
  userContext: UserMeiContext
}

export interface CnaeDisplay {
  codigo: string
  descricao: string
}
