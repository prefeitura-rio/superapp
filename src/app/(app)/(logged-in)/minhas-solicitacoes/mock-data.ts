import type { Request } from './types'

export const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    title: 'Fiscalização de estacionamento irregular de veículo',
    protocol: 'RIO-31550943-2',
    category: 'Serviços',
    subcategory: 'Fiscalização de trânsito',
    organ: 'CTRANS',
    origin: 'Teleatendimento',
    date: '24 MAR 2026',
    dateISO: '2026-03-24',
    deadline: '27 MAR 2026',
    deadlineISO: '2026-03-27',
    address: 'Av. Rio Branco, 1 - Centro',
    description:
      'Veículo estacionado irregularmente bloqueando a saída de garagem há mais de dois dias.',
    status: 'Aberto',
    history: [
      {
        status: 'Aberto',
        date: '24 MAR 2026',
        time: '09:32',
        description:
          'Solicitação registrada e encaminhada para a equipe de fiscalização.',
      },
    ],
  },
  {
    id: '2',
    title: 'Remoção de entulho e bens inservíveis',
    protocol: 'RIO-31555943-2',
    category: 'Ouvidoria',
    subcategory: 'Iluminação Pública',
    organ: 'RIOLUZ',
    origin: 'Teleatendimento',
    date: '06 MAR 2026',
    dateISO: '2026-03-06',
    deadline: '29 MAR 2026',
    deadlineISO: '2026-03-29',
    address: 'R. Lúcio de Mendonça, Botafogo',
    description:
      'Preciso remover duas caçambas de entulho da obra da minha casa.',
    status: 'Em andamento',
    history: [
      {
        status: 'Aberto',
        date: '06 MAR 2026',
        time: '08:15',
        description: 'Solicitação registrada e aguardando triagem.',
      },
      {
        status: 'Em andamento',
        date: '06 MAR 2026',
        time: '10:11',
        description: 'Uma equipe da Comlurb encontra-se trabalhando no local.',
      },
    ],
  },
  {
    id: '3',
    title: 'Reparo de buraco, deformação ou afundamento na pista',
    protocol: 'RIO-31550943-2',
    category: 'Serviços',
    subcategory: 'Conservação de vias',
    organ: 'COR',
    origin: 'App PrefRio',
    date: '12 MAR 2026',
    dateISO: '2026-03-12',
    deadline: '19 MAR 2026',
    deadlineISO: '2026-03-19',
    address: 'R. das Laranjeiras, 400 - Laranjeiras',
    description:
      'Buraco de grande porte no meio da pista, representando risco para veículos e pedestres.',
    status: 'Concluído',
    history: [
      {
        status: 'Aberto',
        date: '12 MAR 2026',
        time: '14:00',
        description: 'Solicitação registrada.',
      },
      {
        status: 'Em andamento',
        date: '14 MAR 2026',
        time: '09:00',
        description: 'Equipe de manutenção deslocada para o local.',
      },
      {
        status: 'Concluído',
        date: '15 MAR 2026',
        time: '17:30',
        description: 'Reparo executado e via liberada.',
      },
    ],
  },
  {
    id: '4',
    title: 'Verificação de frequência irregular da coleta domiciliar',
    protocol: 'RIO-31550943-2',
    category: 'Acesso à informação',
    subcategory: 'Coleta de lixo',
    organ: 'COMLURB',
    origin: 'App PrefRio',
    date: '01 MAR 2026',
    dateISO: '2026-03-01',
    deadline: '15 MAR 2026',
    deadlineISO: '2026-03-15',
    address: 'R. Voluntários da Pátria, 190 - Botafogo',
    description:
      'A coleta de lixo está sendo feita com frequência irregular no bairro, acumulando resíduos na calçada.',
    status: 'Cancelado',
    history: [
      {
        status: 'Aberto',
        date: '01 MAR 2026',
        time: '11:20',
        description: 'Solicitação registrada.',
      },
      {
        status: 'Cancelado',
        date: '03 MAR 2026',
        time: '16:00',
        description:
          'Solicitação cancelada por duplicidade. Já existe um chamado aberto para a mesma região.',
      },
    ],
  },
  {
    id: '5',
    title: 'Remoção de entulho e bens inservíveis',
    protocol: 'RIO-31550943-2',
    category: 'Ouvidoria',
    subcategory: 'Limpeza urbana',
    organ: 'COMLURB',
    origin: 'App PrefRio',
    date: '06 MAR 2026',
    dateISO: '2026-03-06',
    deadline: '13 MAR 2026',
    deadlineISO: '2026-03-13',
    address: 'Av. Pasteur, 250 - Urca',
    description:
      'Móveis velhos e entulho de obra abandonados na calçada há mais de uma semana.',
    status: 'Em andamento',
    history: [
      {
        status: 'Aberto',
        date: '06 MAR 2026',
        time: '07:45',
        description: 'Solicitação registrada.',
      },
      {
        status: 'Em andamento',
        date: '08 MAR 2026',
        time: '13:00',
        description: 'Equipe agendada para coleta.',
      },
    ],
  },
  {
    id: '6',
    title: 'Fiscalização de estacionamento irregular de veículo',
    protocol: 'RIO-31550943-2',
    category: 'Serviços',
    subcategory: 'Fiscalização de trânsito',
    organ: 'CTRANS',
    origin: 'Teleatendimento',
    date: '24 MAR 2026',
    dateISO: '2026-03-24',
    deadline: '27 MAR 2026',
    deadlineISO: '2026-03-27',
    address: 'Rua Senador Vergueiro, 15 - Flamengo',
    description:
      'Motocicleta estacionada sobre a calçada, impedindo a passagem de pedestres e cadeirantes.',
    status: 'Aberto',
    history: [
      {
        status: 'Aberto',
        date: '24 MAR 2026',
        time: '10:05',
        description: 'Solicitação registrada e encaminhada para fiscalização.',
      },
    ],
  },
]

export function getRequestById(id: string): Request | undefined {
  return MOCK_REQUESTS.find(r => r.id === id)
}
