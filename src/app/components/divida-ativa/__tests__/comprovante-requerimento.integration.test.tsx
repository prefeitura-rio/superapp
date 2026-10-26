import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

import { ComprovanteRequerimento } from '../comprovante-requerimento'

const URL_REQUERIMENTOS = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/requerimentos`

function responderCom(urlComprovante: string | undefined) {
  let protocoloConsultado: string | null = null
  server.use(
    http.get(URL_REQUERIMENTOS, ({ request }) => {
      protocoloConsultado = new URL(request.url).searchParams.get('protocolo')
      return HttpResponse.json(
        [{ numProtocoloRequerimentoParcelamento: '000146679', urlComprovante }],
        { status: 200 }
      )
    })
  )
  return () => protocoloConsultado
}

describe('ComprovanteRequerimento', () => {
  test('busca o comprovante pelo protocolo e o oferece para baixar', async () => {
    const consultado = responderCom(
      'https://daminternethom.rio.rj.gov.br/repo/c.pdf?token=abc'
    )

    render(await ComprovanteRequerimento({ protocolo: '146679' }))

    expect(consultado()).toBe('146679')
    const link = screen.getByRole('link', { name: 'Baixar comprovante' })
    expect(link).toHaveAttribute(
      'href',
      'https://daminternethom.rio.rj.gov.br/repo/c.pdf?token=abc'
    )
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('comprovante fora do domínio da Prefeitura não vira link', async () => {
    responderCom('https://exemplo.com/c.pdf')

    render(await ComprovanteRequerimento({ protocolo: '146679' }))

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  test('sem comprovante ainda, não mostra o botão', async () => {
    responderCom(undefined)

    render(await ComprovanteRequerimento({ protocolo: '146679' }))

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  test('protocolo fora do formato nem consulta a API', async () => {
    const consultado = responderCom('https://daminternet.rio.rj.gov.br/c.pdf')

    render(await ComprovanteRequerimento({ protocolo: '2026/abc' }))

    expect(consultado()).toBeNull()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
