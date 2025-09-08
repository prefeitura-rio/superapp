import {
  alvaraIcon,
  cadrioIcon,
  cadunicoIcon,
  dividaAtivaIcon,
  iptuIcon,
  licencaSanitariaIcon,
  multasIcon,
} from './bucket'
import { NEXT_PUBLIC_BUSCA_1746_COLLECTION, NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION } from './venvs'

export const MOST_ACCESSED_SERVICES = [
  {
    id: 'iptu',
    href: `/servicos/categoria/Taxas/84702/${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}`,
    icon: iptuIcon,
    title: 'IPTU',
    description: 'Pague no PIX',
  },
  {
    id: 'cadrio',
    href: `/servicos/categoria/Família/92294/${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}`,
    icon: cadrioIcon,
    title: 'CAD Rio',
    description: 'Agende seu atendimento',
  },
  {
    id: 'multas',
    href: `/servicos/categoria/Transporte/71034/${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}`,
    icon: multasIcon,
    title: 'Multas',
    description: 'Consulta de multas de trânsito',
  },
  {
    id: 'alvara',
    href: `/servicos/categoria/Licenças/91037/${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}`,
    icon: alvaraIcon,
    title: 'Alvará',
    description: 'Consulta prévia de local',
  },
  {
    id: 'licenca-sanitaria',
    href: `/servicos/categoria/Licenças/69823/${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}`,
    icon: licencaSanitariaIcon,
    title: 'Licença Sani...',
    description: 'Veja ou solicite o documento',
  },
  {
    id: 'cadunico',
    href: `/servicos/categoria/Família/10244935327515/${NEXT_PUBLIC_BUSCA_1746_COLLECTION}`,
    icon: cadunicoIcon,
    title: 'CadÚnico',
    description: 'Consulte e atualize seus dados',
  },
  {
    id: 'divida-ativa',
    href: `/servicos/categoria/Taxas/82000/${NEXT_PUBLIC_BUSCA_CARIOCA_DIGITAL_COLLECTION}`,
    icon: dividaAtivaIcon,
    title: 'Dívida ativa',
    description: 'Consulte dívidas de IPTU',
  },
]
