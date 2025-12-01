import {
  alvaraIcon,
  cadrioIcon,
  cadunicoIcon,
  dividaAtivaIcon,
  iptuIcon,
  licencaSanitariaIcon,
  multasIcon,
} from './bucket'

export const MOST_ACCESSED_SERVICES = [
  {
    id: 'iptu',
    href: '/servicos/categoria/taxas/94ff5567-17e5-47f3-8336-4ae209f1a601',
    icon: iptuIcon,
    title: 'IPTU',
    description: 'Pague no PIX',
  },
  {
    id: 'cadrio',
    href: '/servicos/categoria/familia/770618f7-a031-4802-bd44-73520dd45846',
    icon: cadrioIcon,
    title: 'CAD Rio',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: '/servicos/categoria/transporte/b774f0a8-53dd-44d3-850f-50087f9b62c3',
    icon: multasIcon,
    title: 'Multas',
    description: 'Consulta de multas de trânsito',
  },
  {
    id: 'alvara',
    href: '/servicos/categoria/licencas/d1343d86-eb7d-4e65-85c9-47b975896f2a',
    icon: alvaraIcon,
    title: 'Alvará',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: '/servicos/categoria/licencas/ffa3f857-1cc8-406e-8acd-9279399d7123',
    icon: licencaSanitariaIcon,
    title: 'Licença Sani...',
    description: 'Veja ou solicite o documento',
  },
  {
    id: 'cadunico',
    href: '/servicos/categoria/familia/4fecdbea-be40-45c3-ac71-6641bf4a0f1e',
    icon: cadunicoIcon,
    title: 'CadÚnico',
    description: 'Consulte e atualize seus dados',
  },
  // {
  //   id: 'divida-ativa',
  //   href: '/servicos/categoria/taxas/6a5daf79-0022-4cab-af61-96f3a10360e0',
  //   icon: dividaAtivaIcon,
  //   title: 'Dívida ativa',
  //   description: 'Consulte dívidas de IPTU',
  // },
]
