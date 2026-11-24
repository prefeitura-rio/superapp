import { shouldShowCaretakerCard } from '@/lib/maintenance-requests-utils'
import { describe, expect, test } from 'vitest'

describe('shouldShowCaretakerCard', () => {
  test.each([
    // [salesforce, sgrcHistorico, aparece]
    [false, false, true],
    [false, true, true],
    [true, false, true],
    [true, true, false],
  ])(
    'FEATURE_SALESFORCE=%s e FEATURE_SGRC_HISTORICO=%s → card aparece: %s',
    (salesforce, sgrcHistorico, aparece) => {
      expect(
        shouldShowCaretakerCard({ total: 3, salesforce, sgrcHistorico })
      ).toBe(aparece)
    }
  )

  test('sem chamados o card nunca aparece', () => {
    expect(
      shouldShowCaretakerCard({
        total: 0,
        salesforce: false,
        sgrcHistorico: false,
      })
    ).toBe(false)
  })
})
