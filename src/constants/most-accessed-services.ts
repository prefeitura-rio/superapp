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
    href: '/services/category/Taxas/84702/carioca-digital',
    icon: iptuIcon,
    title: 'IPTU',
    description: 'Pague com desconto no PIX',
  },
  {
    id: 'cadrio',
    href: '/services/category/Família/92294/carioca-digital',
    icon: cadrioIcon,
    title: 'CAD Rio',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: '/services/category/Transporte/71536/carioca-digital',
    icon: multasIcon,
    title: 'Multas',
    description: 'Consulta de multas de trânsito',
  },
  {
    id: 'alvara',
    href: '/services/category/Licenças/91037/carioca-digital',
    icon: alvaraIcon,
    title: 'Alvará',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: '/services/category/Licenças/69823/carioca-digital',
    icon: licencaSanitariaIcon,
    title: 'Licença Sani...',
    description: 'Veja ou solicite o documento',
  },
  {
    id: 'cadunico',
    href: '/services/category/Família/10244935327515/1746',
    icon: cadunicoIcon,
    title: 'CadÚnico',
    description: 'Consulte e atualize seus dados',
  },
  {
    id: 'divida-ativa',
    href: '/services/category/Taxas/82000/carioca-digital',
    icon: dividaAtivaIcon,
    title: 'Dívida ativa',
    description: 'Consulte dívidas de IPTU',
  },
]
