import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { EscolhaTipoSolicitante } from '../escolha-tipo-solicitante'
import { isTipoSolicitante } from '../tipos-solicitante'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => {
  push.mockClear()
})

const PARAMS = {
  cda: '01140646202600',
  cdas: '01/140646/2026-00',
  data: '15/10/2026',
  parcelas: '2',
}

describe('EscolhaTipoSolicitante', () => {
  test('oferece os quatro vínculos, sem "Outro"', () => {
    render(<EscolhaTipoSolicitante searchParamsAtual={PARAMS} />)

    expect(
      screen.getByRole('heading', { name: 'Escolha o tipo de vínculo' })
    ).toBeInTheDocument()

    const opcoes = screen.getAllByRole('button')
    expect(opcoes).toHaveLength(4)
    expect(opcoes[0]).toHaveTextContent('O próprio contribuinte')
    expect(opcoes[1]).toHaveTextContent('Sócio responsável')
    expect(opcoes[2]).toHaveTextContent('Procurador')
    expect(opcoes[3]).toHaveTextContent('Atual proprietário/possuidor')
    expect(screen.queryByText('Outro')).toBeNull()
  })

  test('escolher um vínculo segue para os dados do requerente com ?tipo=', async () => {
    const user = userEvent.setup()
    render(<EscolhaTipoSolicitante searchParamsAtual={PARAMS} />)

    await user.click(screen.getByRole('button', { name: /Sócio responsável/ }))

    const destino = new URL(push.mock.calls[0][0], 'http://x')
    expect(destino.searchParams.get('etapa')).toBe('requerente')
    expect(destino.searchParams.get('tipo')).toBe('SOCIO_RESPONSAVEL')
    expect(destino.searchParams.get('parcelas')).toBe('2')
  })

  test('voltando dos documentos, o vínculo escolhido fica marcado', () => {
    render(
      <EscolhaTipoSolicitante
        searchParamsAtual={{ ...PARAMS, tipo: 'PROCURADOR' }}
      />
    )

    expect(screen.getByRole('button', { name: /Procurador/ })).toHaveAttribute(
      'aria-current',
      'true'
    )
  })

  // A page (Server Component) chama `isTipoSolicitante`. Se o módulo virar client, a chamada
  // lança no servidor e o error.tsx manda o cidadão para /servicos — jsdom não pega isso.
  test('a validação do tipo mora num módulo sem "use client"', () => {
    const fonte = readFileSync(
      resolve(__dirname, '../tipos-solicitante.ts'),
      'utf-8'
    )

    expect(fonte).not.toMatch(/^\s*['"]use client['"]/m)
  })

  // Links salvos com os tipos antigos caem na escolha em vez de quebrar a tela.
  test('tipos antigos não são mais aceitos', () => {
    expect(isTipoSolicitante('PESSOA_FISICA')).toBe(false)
    expect(isTipoSolicitante('OUTRO')).toBe(false)
    expect(isTipoSolicitante('CONTRIBUINTE')).toBe(true)
  })
})
