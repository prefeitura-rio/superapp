import {
  alvaraIcon,
  cadrioIcon,
  dividaAtivaIcon,
  iptuIcon,
  licencaSanitariaIcon,
  multasIcon,
} from './bucket'

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
    href: '/servicos/categoria/familia/cadrio-agendamento-770618f7',
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
    href: '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610',
    icon: dividaAtivaIcon,
    title: 'Dívida Ativa: Débitos de IPTU ',
    description: 'Consulta de débitos de IPTU em Dívida Ativa',
  },
]
