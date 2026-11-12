import { afterEach, describe, expect, test, vi } from 'vitest'
import type { GlobalMenuEntry, GlobalMenuLink } from '../global-menu'

/**
 * `ENTRIES` é avaliado na carga do módulo (as feature flags são constantes de
 * build), então cada cenário de flag precisa reimportar o módulo.
 */
async function carregarMenu(env: Record<string, string> = {}) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'true')
  vi.stubEnv(
    'NEXT_PUBLIC_TICKET_FORM_BASE_URL',
    'https://1746.example/protocolo'
  )
  for (const [chave, valor] of Object.entries(env)) {
    vi.stubEnv(chave, valor)
  }
  const { buildGlobalMenu } = await import('../global-menu')
  return buildGlobalMenu
}

function idsDe(entradas: GlobalMenuEntry[]) {
  return entradas.map(e => e.id)
}

function itensDaSecao(entradas: GlobalMenuEntry[], id: string) {
  const secao = entradas.find(e => e.id === id)
  if (!secao || secao.kind !== 'section') return []
  return secao.items.map(i => i.id)
}

function item(
  entradas: GlobalMenuEntry[],
  id: string
): GlobalMenuLink | undefined {
  for (const entrada of entradas) {
    if (entrada.id === id) return entrada
    if (entrada.kind === 'section') {
      const achado = entrada.items.find(i => i.id === id)
      if (achado) return achado
    }
  }
  return undefined
}

afterEach(() => {
  vi.unstubAllEnvs()
})

/** Ordem e hierarquia do "Handoff - fluxo de menu" (Figma SuperApp). */
describe('buildGlobalMenu — fiel ao handoff', () => {
  test('deslogado: itens e ordem do handoff', async () => {
    const entradas = (await carregarMenu())(false)

    expect(idsDe(entradas)).toEqual([
      'servicos',
      'documentos',
      'oportunidades-cariocas',
      'atendimentos',
      'termos-de-uso',
      'carta-de-servicos',
      'faq',
    ])
    expect(itensDaSecao(entradas, 'oportunidades-cariocas')).toEqual([
      'ver-cursos',
      'ver-vagas',
    ])
    expect(itensDaSecao(entradas, 'atendimentos')).toEqual([
      'consulta-protocolo',
      'ouvidoria',
      'lai',
    ])
  })

  test('logado: itens e ordem do handoff', async () => {
    const entradas = (await carregarMenu())(true)

    expect(idsDe(entradas)).toEqual([
      'servicos',
      'documentos',
      'oportunidades-cariocas',
      'atendimentos',
      'termos-de-uso',
      'carta-de-servicos',
      'faq',
      'meu-perfil',
    ])
    expect(itensDaSecao(entradas, 'oportunidades-cariocas')).toEqual([
      'ver-cursos',
      'meus-cursos',
      'certificados',
      'ver-vagas',
      'minhas-candidaturas',
      'meu-curriculo',
    ])
    expect(itensDaSecao(entradas, 'atendimentos')).toEqual([
      'minhas-solicitacoes',
      'ouvidoria',
      'lai',
    ])
  })

  test('Meus cursos/certificados ficam abaixo de Ver cursos e Minhas candidaturas/currículo abaixo de Ver vagas', async () => {
    const entradas = (await carregarMenu())(true)

    expect(item(entradas, 'ver-cursos')?.level ?? 1).toBe(1)
    expect(item(entradas, 'ver-vagas')?.level ?? 1).toBe(1)
    for (const id of [
      'meus-cursos',
      'certificados',
      'minhas-candidaturas',
      'meu-curriculo',
    ]) {
      expect(item(entradas, id)?.level).toBe(2)
    }
    expect(item(entradas, 'certificados')?.label).toBe('Meus certificados')
  })

  test('não há Página inicial, Outros nem Autorizações', async () => {
    const buildGlobalMenu = await carregarMenu()

    for (const logado of [true, false]) {
      const ids = idsDe(buildGlobalMenu(logado))
      expect(ids).not.toContain('home')
      expect(ids).not.toContain('outros')
      expect(item(buildGlobalMenu(logado), 'autorizacoes')).toBeUndefined()
    }
  })
})

describe('destinos', () => {
  test('Termos de uso e política de privacidade leva à lista de Termos de uso', async () => {
    const buildGlobalMenu = await carregarMenu()

    for (const logado of [true, false]) {
      expect(item(buildGlobalMenu(logado), 'termos-de-uso')).toMatchObject({
        label: 'Termos de uso e política de privacidade',
        href: '/termos-de-uso',
      })
      expect(
        item(buildGlobalMenu(logado), 'politica-de-privacidade')
      ).toBeUndefined()
    }
  })

  test('Documentos: carteira logado, autenticação necessária deslogado', async () => {
    const buildGlobalMenu = await carregarMenu()

    expect(item(buildGlobalMenu(true), 'documentos')?.href).toBe('/carteira')
    expect(item(buildGlobalMenu(false), 'documentos')?.href).toBe(
      '/autenticacao-necessaria/carteira'
    )
  })

  test('Ouvidoria e LAI: aba de Minhas solicitações logado, formulário deslogado', async () => {
    const buildGlobalMenu = await carregarMenu()

    expect(item(buildGlobalMenu(true), 'ouvidoria')?.href).toBe(
      '/minhas-solicitacoes?filtro=ouvidoria'
    )
    expect(item(buildGlobalMenu(true), 'lai')?.href).toBe(
      '/minhas-solicitacoes?filtro=acesso-a-informacao'
    )
    expect(item(buildGlobalMenu(false), 'ouvidoria')?.href).toBe(
      'https://1746.example/protocolo/ouvidoria'
    )
    expect(item(buildGlobalMenu(false), 'lai')?.href).toBe(
      'https://1746.example/protocolo/lai'
    )
  })

  test('Carta de serviços e Perguntas frequentes', async () => {
    const entradas = (await carregarMenu())(false)

    expect(item(entradas, 'carta-de-servicos')?.href).toBe('/carta-de-servicos')
    expect(item(entradas, 'faq')?.href).toBe('/faq')
  })
})

describe('feature flags', () => {
  test('sem Salesforce: some Atendimentos e Carta de serviços (rotas bloqueadas no middleware)', async () => {
    const buildGlobalMenu = await carregarMenu({
      NEXT_PUBLIC_FEATURE_SALESFORCE: 'false',
    })

    for (const logado of [true, false]) {
      const ids = idsDe(buildGlobalMenu(logado))
      expect(ids).not.toContain('atendimentos')
      expect(ids).not.toContain('carta-de-servicos')
    }
  })

  test('esconde os itens de Empregos quando só Cursos está ligado', async () => {
    const buildGlobalMenu = await carregarMenu({
      NEXT_PUBLIC_FEATURE_FLAG: 'cursos',
    })

    expect(
      itensDaSecao(buildGlobalMenu(true), 'oportunidades-cariocas')
    ).toEqual(['ver-cursos', 'meus-cursos', 'certificados'])
  })

  test('remove a seção inteira quando nenhum serviço dela está ligado', async () => {
    const buildGlobalMenu = await carregarMenu({
      NEXT_PUBLIC_FEATURE_FLAG: 'mei',
    })

    expect(idsDe(buildGlobalMenu(true))).not.toContain('oportunidades-cariocas')
  })
})
