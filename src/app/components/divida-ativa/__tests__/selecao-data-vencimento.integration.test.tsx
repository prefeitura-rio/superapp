import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { SelecaoDataVencimento } from '../selecao-data-vencimento'

const push = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => searchParams,
}))

beforeEach(() => {
  push.mockClear()
  searchParams = new URLSearchParams()
})

const DATAS = ['15/10/2026', '20/10/2026']
const PARAMS = { cda: '01140646202600', cdas: '01/140646/2026-00' }

describe('SelecaoDataVencimento', () => {
  test('voltando das parcelas, a data escolhida reaparece marcada', () => {
    searchParams = new URLSearchParams('data=20/10/2026&etapa=data')
    render(<SelecaoDataVencimento datas={DATAS} searchParamsAtual={PARAMS} />)

    expect(screen.getByRole('radio', { name: '20/10/2026' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  })

  test('"Continuar" leva às parcelas com ?data= e sem ?etapa=, mantendo o resto', async () => {
    const user = userEvent.setup()
    render(
      <SelecaoDataVencimento
        datas={DATAS}
        searchParamsAtual={{ ...PARAMS, parcelas: '3', etapa: 'data' }}
      />
    )

    await user.click(screen.getByRole('radio', { name: '15/10/2026' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const destino = new URL(push.mock.calls[0][0], 'http://x')
    expect(destino.pathname).toBe('/divida-ativa/parcelamento/simulacao')
    expect(destino.searchParams.get('data')).toBe('15/10/2026')
    expect(destino.searchParams.has('etapa')).toBe(false)
    expect(destino.searchParams.get('parcelas')).toBe('3')
    expect(destino.searchParams.get('cdas')).toBe('01/140646/2026-00')
  })
})
