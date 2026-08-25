import { afterEach, describe, expect, test, vi } from 'vitest'
import type { GlobalMenuEntry } from '../global-menu'

/**
 * `ENTRIES` é avaliado na carga do módulo (as feature flags são constantes de
 * build), então cada cenário de flag precisa reimportar o módulo.
 */
async function carregarMenu(env: Record<string, string> = {}) {
  vi.resetModules()
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

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('buildGlobalMenu', () => {
  describe('menu deslogado', () => {
    test('remove os itens que exigem login em vez de desabilitá-los', async () => {
      const buildGlobalMenu = await carregarMenu()
      const entradas = buildGlobalMenu(false)

      expect(itensDaSecao(entradas, 'oportunidades-cariocas')).toEqual([
        'ver-cursos',
        'ver-vagas',
      ])
      expect(itensDaSecao(entradas, 'outros')).not.toContain('autorizacoes')
    })

    test('Documentos continua visível, apontando para a tela de login', async () => {
      const buildGlobalMenu = await carregarMenu()
      const entradas = buildGlobalMenu(false)

      const documentos = entradas.find(e => e.id === 'documentos')
      expect(documentos).toBeDefined()
      expect(documentos?.kind === 'link' && documentos.href).toBe(
        '/autenticacao-necessaria/carteira'
      )
    })

    test('mantém os acessos públicos', async () => {
      const buildGlobalMenu = await carregarMenu()
      const entradas = buildGlobalMenu(false)

      expect(idsDe(entradas)).toEqual(
        expect.arrayContaining(['home', 'servicos', 'atendimentos', 'outros'])
      )
      expect(itensDaSecao(entradas, 'atendimentos')).toEqual(
        expect.arrayContaining(['consulta-protocolo', 'ouvidoria'])
      )
    })
  })

  describe('menu logado', () => {
    test('inclui os itens restritos', async () => {
      const buildGlobalMenu = await carregarMenu()
      const entradas = buildGlobalMenu(true)

      const documentos = entradas.find(e => e.id === 'documentos')
      expect(documentos?.kind === 'link' && documentos.href).toBe('/carteira')
      expect(itensDaSecao(entradas, 'oportunidades-cariocas')).toEqual([
        'ver-cursos',
        'meus-cursos',
        'certificados',
        'ver-vagas',
        'minhas-candidaturas',
        'meu-curriculo',
      ])
      expect(itensDaSecao(entradas, 'outros')).toContain('autorizacoes')
    })
  })

  describe('destinos ainda não definidos pelo produto', () => {
    test('não renderiza itens sem href, logado ou não', async () => {
      const buildGlobalMenu = await carregarMenu()

      for (const logado of [true, false]) {
        const entradas = buildGlobalMenu(logado)
        expect(itensDaSecao(entradas, 'atendimentos')).not.toContain('lai')
        expect(itensDaSecao(entradas, 'outros')).not.toContain(
          'politica-de-privacidade'
        )
        expect(itensDaSecao(entradas, 'outros')).not.toContain(
          'carta-de-servicos'
        )
      }
    })

    test('mantém os destinos que já existem', async () => {
      const buildGlobalMenu = await carregarMenu()
      const entradas = buildGlobalMenu(false)

      expect(itensDaSecao(entradas, 'outros')).toEqual(
        expect.arrayContaining(['termos-de-uso', 'faq'])
      )
    })
  })

  describe('feature flags', () => {
    test('esconde os itens de Empregos quando só Cursos está ligado', async () => {
      const buildGlobalMenu = await carregarMenu({
        NEXT_PUBLIC_FEATURE_FLAG: 'cursos',
      })
      const entradas = buildGlobalMenu(true)

      expect(itensDaSecao(entradas, 'oportunidades-cariocas')).toEqual([
        'ver-cursos',
        'meus-cursos',
        'certificados',
      ])
    })

    test('remove a seção inteira quando nenhum serviço dela está ligado', async () => {
      const buildGlobalMenu = await carregarMenu({
        NEXT_PUBLIC_FEATURE_FLAG: 'mei',
      })
      const entradas = buildGlobalMenu(true)

      expect(idsDe(entradas)).not.toContain('oportunidades-cariocas')
    })

    test('Minhas solicitações depende da flag de chamados', async () => {
      const semChamados = await carregarMenu({
        NEXT_PUBLIC_FEATURE_CHAMADOS: 'false',
      })
      expect(itensDaSecao(semChamados(true), 'atendimentos')).not.toContain(
        'minhas-solicitacoes'
      )

      const comChamados = await carregarMenu({
        NEXT_PUBLIC_FEATURE_CHAMADOS: 'true',
      })
      expect(itensDaSecao(comChamados(true), 'atendimentos')).toContain(
        'minhas-solicitacoes'
      )
    })
  })
})
