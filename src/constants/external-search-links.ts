/**
 * External search links configuration
 *
 * These are hardcoded search results that appear with higher priority
 * in the search results. They are used when certain external links
 * are not available in the API.
 */

export interface ExternalSearchLink {
  titulo: string
  tipo: 'link_externo'
  url: string
  descricao: string
  palavras_chave: string[]
  id?: string
}

/**
 * Hardcoded external search links
 *
 * These links will be filtered and merged with API search results,
 * appearing first in the results list.
 */
export const EXTERNAL_SEARCH_LINKS: ExternalSearchLink[] = [
  {
    titulo: 'Jaé - Sistema de Bilhetagem Digital',
    tipo: 'link_externo',
    url: 'https://jae.com.br/',
    palavras_chave: [
      'Jaé transporte público Rio de Janeiro',
      'sistema de bilhetagem digital Jaé',
      'Jaé bilhete eletrônico',
      'Jaé Rio transporte coletivo',
      'Jaé BRT VLT ônibus cabritinhos',
      'informações Jaé SMTR',
      'Jaé cadastro e atendimento',
      'app Jaé transporte',
      'como usar Jaé',
      'Jaé atendimento 0800 2121 828',
      'suporte Jaé Rio de Janeiro',
      'contato Jaé',
      'Jaé bilhetagem digital prefeitura do Rio',
      'Jaé passageiros transporte municipal',
      'o que é o sistema de bilhetagem Jaé',
      'como solicitar informações sobre Jaé',
      'guia completo do Jaé transporte',
      'benefícios do sistema Jaé',
      'transporte público no Rio de Janeiro',
      'Portal Carioca Digital Jaé',
      'como carregar cartão Jaé',
      'carregar cartão Jaé',
      'recarregar cartão Jaé',
      'como recarregar cartão Jaé',
      'cartão Jaé como carregar',
      'cartão bilhetagem digital',
      'carregar bilhete Jaé',
      'recarga cartão transporte Rio',
    ],
    descricao:
      'Novo sistema de bilhetagem digital que vai funcionar em todos os modais de transporte coletivo regulamentados pela Prefeitura. São eles: BRT, VLT, ônibus municipais, vans municipais e cabritinhos.',
  },
  {
    titulo: 'Rock in Rio 2026',
    tipo: 'link_externo',
    url: 'https://rockinrio.com/rio/pt-br/home/',
    descricao:
      'Rock in Rio é um festival de música que acontece no Rio de Janeiro.',
    palavras_chave: [
      'Rock in Rio 2026',
      'Rock in Rio Rio de Janeiro',
      'Rock in Rio 2026 programação',
      'Rock in Rio 2026 ingressos',
      'Rock in Rio 2026 local',
    ],
  },
]
