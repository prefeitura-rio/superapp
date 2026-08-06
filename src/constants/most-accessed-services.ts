import {
  alvaraIcon,
  cadrioIcon,
  dividaAtivaIcon,
  iptuIcon,
  licencaSanitariaIcon,
  multasIcon,
} from './bucket'

/**
 * Página do catálogo para onde o card de Dívida Ativa aponta enquanto o módulo próprio
 * não está no ar.
 */
const DIVIDA_ATIVA_CATALOGO =
  '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610'

/**
 * Destino do card de Dívida Ativa.
 *
 * Com a flag ligada (homologação), o card leva ao módulo reconstruído no Pref.Rio; com ela
 * desligada — o caso de staging e produção hoje — segue apontando para o catálogo, exatamente
 * como antes. Sem isso o módulo fica inalcançável pela navegação quando a flag é ligada para
 * homologação: o middleware libera a rota, mas nada no app leva até ela.
 *
 * Apontar o card em definitivo é decisão de release do time Pref.Rio (ver `docs/divida-ativa.md`).
 */
const dividaAtivaHref =
  process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA === 'true'
    ? '/servicos/divida-ativa'
    : DIVIDA_ATIVA_CATALOGO

export const MOST_ACCESSED_SERVICES = [
  {
    id: 'iptu',
    href: '/servicos/categoria/taxas/iptu-2025-94ff5567',
    icon: iptuIcon,
    title: 'IPTU 2026',
    description: 'Pague no PIX',
  },
  {
    id: 'cadrio',
    href: '/servicos/categoria/cidadania/inscricao-e-atualizacao-do-cadastro-unico-8cafda60',
    icon: cadrioIcon,
    title: 'CADRio Agendamento',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa-1d76fc90',
    icon: multasIcon,
    title: 'Multas: Consulta de Multa',
    description: 'Consulta de Multas',
  },
  {
    id: 'alvara',
    href: '/servicos/categoria/licencas/alvara-consulta-previa-de-local-a0cf6969',
    icon: alvaraIcon,
    title: 'Alvará: Consulta prévia de local',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento-ffa3f857',
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
