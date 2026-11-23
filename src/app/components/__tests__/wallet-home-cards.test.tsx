import { buildHomeWalletCards } from '@/app/components/wallet-home-cards'
import type { ModelsMaintenanceRequest } from '@/http/models'
import { describe, expect, test } from 'vitest'

const CHAMADOS: ModelsMaintenanceRequest[] = [
  { id: '1', status: 'Aberto' },
  { id: '2', status: 'Fechado com solução' },
]

function temCardCuidadosComACidade(
  isSalesforceEnabled: boolean,
  sgrcHistoricoEnabled?: boolean
) {
  return buildHomeWalletCards({
    maintenanceRequests: CHAMADOS,
    isSalesforceEnabled,
    sgrcHistoricoEnabled,
  }).some(card => card.key === 'caretaker')
}

describe('Carteira da home: card "Cuidados com a Cidade"', () => {
  test('aparece com FEATURE_SALESFORCE desligada (produção hoje)', () => {
    expect(temCardCuidadosComACidade(false)).toBe(true)
  })

  test('continua com FEATURE_SALESFORCE ligada e o histórico SGRC desligado', () => {
    expect(temCardCuidadosComACidade(true, false)).toBe(true)
    expect(temCardCuidadosComACidade(true)).toBe(true)
  })

  test('sai quando o histórico passa para Minhas Solicitações (as duas flags)', () => {
    expect(temCardCuidadosComACidade(true, true)).toBe(false)
  })
})
