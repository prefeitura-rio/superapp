import { chamadosKeys } from '@/lib/chamados/query-keys'
import { ServerFeatureFlagsProvider } from '@/providers/server-feature-flags-provider'
import { makeTestQueryClient } from '@/test/render-with-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/constants/url', () => ({
  TICKET_FORM_BASE_URL: 'https://1746.example.org/protocolo',
}))

import { ChamadosCacheSync } from '../chamados-cache-sync'

const MARKER = 'chamados_formulario_aberto'

function marcador() {
  return document.cookie
    .split('; ')
    .find(c => c.startsWith(`${MARKER}=`))
    ?.split('=')[1]
}

function limparMarcador() {
  document.cookie = `${MARKER}=; Max-Age=0; Path=/`
}

function montar({ salesforce = true } = {}) {
  const queryClient = makeTestQueryClient()
  const sf = chamadosKeys.salesforce()
  const sgrc = chamadosKeys.sgrc(1)
  queryClient.setQueryData(sf, { protocolos: [] })
  queryClient.setQueryData(sgrc, { protocolos: [] })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <ServerFeatureFlagsProvider flags={{ salesforce, sgrcHistorico: true }}>
        <a href="https://1746.example.org/protocolo?a=1">abrir chamado</a>
        <a href="/minhas-solicitacoes">minhas</a>
        <ChamadosCacheSync />
      </ServerFeatureFlagsProvider>
    </QueryClientProvider>
  )
  return {
    ...view,
    sf: () => queryClient.getQueryState(sf)?.isInvalidated,
    sgrc: () => queryClient.getQueryState(sgrc)?.isInvalidated,
  }
}

function voltarParaAba() {
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    configurable: true,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(limparMarcador)
afterEach(limparMarcador)

describe('ChamadosCacheSync', () => {
  it('clicar no link do formulário marca a ida', () => {
    const { getByText } = montar()
    fireEvent.click(getByText('abrir chamado'))
    expect(marcador()).toBeDefined()
  })

  it('links internos não marcam', () => {
    const { getByText } = montar()
    fireEvent.click(getByText('minhas'))
    expect(marcador()).toBeUndefined()
  })

  it('ao voltar, invalida o Salesforce e mantém o SGRC (histórico)', () => {
    const t = montar()
    fireEvent.click(t.getByText('abrir chamado'))
    voltarParaAba()
    expect(t.sf()).toBe(true)
    expect(t.sgrc()).toBe(false)
    expect(marcador()).toBeUndefined()
  })

  it('restauração do bfcache (pageshow persisted) também invalida', () => {
    const t = montar()
    fireEvent.click(t.getByText('abrir chamado'))
    const evento = new Event('pageshow') as PageTransitionEvent
    Object.defineProperty(evento, 'persisted', { value: true })
    window.dispatchEvent(evento)
    expect(t.sf()).toBe(true)
  })

  it('voltar à aba sem ter ido ao formulário não invalida nada', () => {
    const t = montar()
    voltarParaAba()
    expect(t.sf()).toBe(false)
  })

  it('marcador expirado (mais de 1 h) é descartado sem invalidar', () => {
    const t = montar()
    document.cookie = `${MARKER}=${Date.now() - 2 * 60 * 60 * 1000}; Path=/`
    voltarParaAba()
    expect(t.sf()).toBe(false)
  })

  it('com a flag do Salesforce desligada, não faz nada', () => {
    const t = montar({ salesforce: false })
    fireEvent.click(t.getByText('abrir chamado'))
    expect(marcador()).toBeUndefined()
  })
})
