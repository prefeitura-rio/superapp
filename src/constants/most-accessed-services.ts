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
    href: '/servicos/categoria/taxas/94ff5567-17e5-47f3-8336-4ae209f1a601',
    icon: iptuIcon,
    title: 'IPTU 2025',
    description: 'Pague no PIX',
  },
  {
    id: 'cadrio',
    href: '/servicos/categoria/familia/770618f7-a031-4802-bd44-73520dd45846',
    icon: cadrioIcon,
    title: 'CADRio Agendamento',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: '/servicos/categoria/transporte/1d76fc90-b8ca-4c8a-9e07-a1cc03979968',
    icon: multasIcon,
    title: 'Multas: Consulta de Multa',
    description: 'Consulta de Multas',
  },
  {
    id: 'alvara',
    href: '/servicos/categoria/licencas/a0cf6969-edf0-4310-984a-d895d89d246b',
    icon: alvaraIcon,
    title: 'Alvará: Consulta prévia de local',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: '/servicos/categoria/licencas/ffa3f857-1cc8-406e-8acd-9279399d7123',
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
    href: '/servicos/categoria/tributos/4a98e610-eab0-4ec5-baab-e93cec6803fe',
    icon: dividaAtivaIcon,
    title: 'Dívida Ativa: Débitos de IPTU ',
    description: 'Consulta de débitos de IPTU em Dívida Ativa',
  },
]
