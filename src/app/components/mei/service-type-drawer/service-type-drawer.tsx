'use client'

import { hasCompatibleCnae } from '@/lib/mei-utils'
import { CnaeIncompatibleSheet } from './cnae-incompatible-sheet'
import { CnaeInfoSheet } from './cnae-info-sheet'
import { IrregularStatusSheet } from './irregular-status-sheet'
import { NoMeiSheet } from './no-mei-sheet'
import type { ServiceTypeDrawerProps, ServiceTypeSheetType, UserMeiContext } from './types'

function determineSheetType(
  userContext: UserMeiContext,
  opportunityCnaeIds?: string[]
): ServiceTypeSheetType {
  const { isLoggedIn, hasMei, situacaoCadastral, userCnaes } = userContext

  // Não logado → sempre info
  if (!isLoggedIn) {
    return 'info'
  }

  // Logado sem MEI → no-mei
  if (!hasMei) {
    return 'no-mei'
  }

  // Logado com MEI mas situação irregular → irregular
  if (situacaoCadastral && situacaoCadastral !== 'Ativa') {
    return 'irregular'
  }

  // Logado com MEI ativo mas CNAEs incompatíveis → incompatible
  if (opportunityCnaeIds?.length && userCnaes?.length) {
    const isCompatible = hasCompatibleCnae(userCnaes, opportunityCnaeIds)
    if (!isCompatible) {
      return 'incompatible'
    }
  }

  // Default → info (CNAEs compatíveis ou sem validação)
  return 'info'
}

export function ServiceTypeDrawer({
  open,
  onOpenChange,
  opportunityCnaeIds,
  userContext,
}: ServiceTypeDrawerProps) {
  const sheetType = determineSheetType(userContext, opportunityCnaeIds)

  switch (sheetType) {
    case 'no-mei':
      return <NoMeiSheet open={open} onOpenChange={onOpenChange} />

    case 'irregular':
      return <IrregularStatusSheet open={open} onOpenChange={onOpenChange} />

    case 'incompatible':
      return (
        <CnaeIncompatibleSheet
          open={open}
          onOpenChange={onOpenChange}
          cnaeIds={opportunityCnaeIds}
        />
      )

    default:
      return (
        <CnaeInfoSheet
          open={open}
          onOpenChange={onOpenChange}
          cnaeIds={opportunityCnaeIds}
          userCnaes={userContext.userCnaes}
        />
      )
  }
}

// Re-export helper for use in ActionButton logic
export { determineSheetType }
