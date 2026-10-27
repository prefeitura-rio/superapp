import {
  alvaraIcon,
  cadrioIcon,
  dividaAtivaIcon,
  iptuIcon,
  licencaSanitariaIcon,
  multasIcon,
} from './bucket'
import { CARTA_SERVICOS_API_ENABLED } from './venvs'

export type PopularServiceId =
  | 'iptu'
  | 'cadrio'
  | 'multas'
  | 'alvara'
  | 'licenca-sanitaria'
  | 'divida-ativa'

/**
 * Slugs da app-busca-search (sufixo de id). Vale com `CARTA_SERVICOS_API_ENABLED`
 * desligada — o caso de produção enquanto a migração não sobe.
 */
const BUSCA_SEARCH_HREFS: Record<PopularServiceId, string> = {
  iptu: '/servicos/categoria/taxas/iptu-2025-94ff5567',
  cadrio:
    '/servicos/categoria/cidadania/inscricao-e-atualizacao-do-cadastro-unico-8cafda60',
  multas:
    '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa-1d76fc90',
  alvara:
    '/servicos/categoria/licencas/alvara-consulta-previa-de-local-a0cf6969',
  'licenca-sanitaria':
    '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento-ffa3f857',
  'divida-ativa':
    '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610',
}

/**
 * Slugs canônicos da app-catalogo. Vale com `CARTA_SERVICOS_API_ENABLED` ligada.
 */
const CATALOGO_HREFS: Record<PopularServiceId, string> = {
  iptu: '/servicos/categoria/tributos/iptu-2026',
  cadrio: '/servicos/categoria/saude/cadrio-agendamento',
  multas: '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa',
  alvara: '/servicos/categoria/licencas/alvara-consulta-previa-de-local',
  'licenca-sanitaria':
    '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento',
  'divida-ativa':
    '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa',
}

/**
 * Caminhos de Mais acessados / Mais pesquisados.
 *
 * Pura de propósito: a busca é client component e recebe o booleano do servidor.
 * Não lê `process.env`.
 */
export function popularServiceHrefs(
  cartaServicosEnabled: boolean
): Record<PopularServiceId, string> {
  return cartaServicosEnabled ? CATALOGO_HREFS : BUSCA_SEARCH_HREFS
}

const catalogHrefs = popularServiceHrefs(CARTA_SERVICOS_API_ENABLED)

/**
 * Destino do card de Dívida Ativa.
 *
 * Com a flag do módulo ligada (homologação), o card leva a `/divida-ativa`. Com ela
 * desligada — staging e produção hoje — aponta para a ficha no catálogo, no slug da
 * app-busca-search ou da app-catalogo conforme `CARTA_SERVICOS_API_ENABLED`. Sem o
 * atalho o módulo fica inalcançável quando a flag é ligada: o middleware libera a
 * rota, mas nada no app leva até ela.
 *
 * Apontar o card em definitivo é decisão de release do time Pref.Rio (ver `docs/divida-ativa.md`).
 */
const dividaAtivaHref =
  process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA === 'true'
    ? '/divida-ativa'
    : catalogHrefs['divida-ativa']

export const MOST_ACCESSED_SERVICES = [
  {
    id: 'iptu',
    href: catalogHrefs.iptu,
    icon: iptuIcon,
    title: 'IPTU 2026',
    description: 'Pague no PIX',
  },
  {
    id: 'cadrio',
    href: catalogHrefs.cadrio,
    icon: cadrioIcon,
    title: 'CADRio Agendamento',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: catalogHrefs.multas,
    icon: multasIcon,
    title: 'Multas: Consulta de Multa',
    description: 'Consulta de Multas',
  },
  {
    id: 'alvara',
    href: catalogHrefs.alvara,
    icon: alvaraIcon,
    title: 'Alvará: Consulta prévia de local',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: catalogHrefs['licenca-sanitaria'],
    icon: licencaSanitariaIcon,
    title: 'Licença Sanitária de Funcionamento',
    description: 'Veja ou solicite o documento',
  },
  // {
  //   id: 'cadunico',
  //   href: '/servicos/categoria/familia/4fecdbea-be40-45c3-ac71-6641bf4a0f1e',
  //   icon: cadunicoIcon,
  //   title: 'CadÚnico',
  //   description: 'Consulte e atualize seus dados',
  // },
  {
    id: 'divida-ativa',
    href: dividaAtivaHref,
    icon: dividaAtivaIcon,
    title: 'Dívida Ativa: Débitos de IPTU ',
    description: 'Consulta de débitos de IPTU em Dívida Ativa',
  },
]
