/** Chamado no formato que o RMI já espera. O CPF não sai nas respostas. */
export interface AndamentoSgrc {
  data: string
  tipo: string
  descricao: string
  fl_publico: number
}

export interface ChamadoSgrc {
  id: string
  protocolo: string
  cpf: string
  categoria: string
  tipo: string
  subtipo: string
  status: string
  nome_unidade_organizacional: string
  data_inicio: string
  data_alvo_finalizacao?: string
  descricao: string
  bairro: string
  logradouro: string
  andamentos: AndamentoSgrc[]
  loaded_at: string
}

export const CPF_DONO_SGRC = '12345678901'
export const CPF_TERCEIRO_SGRC = '98765432100'
export const PROTOCOLO_DONO_SGRC = 'RIO-48291037-6'
export const PROTOCOLO_DONO_CONCLUIDO_SGRC = 'RIO-10928374-2'
export const PROTOCOLO_TERCEIRO_SGRC = 'RIO-55554444-1'

const CARGA = '2026-10-30T14:00:00.000Z'

const CHAMADOS: ChamadoSgrc[] = [
  {
    id: '17469001',
    protocolo: PROTOCOLO_DONO_SGRC,
    cpf: CPF_DONO_SGRC,
    categoria: 'Iluminação pública',
    tipo: 'Reparo',
    subtipo: 'Lâmpada queimada',
    status: 'Em andamento',
    nome_unidade_organizacional: 'RIOLUZ',
    data_inicio: '2026-09-12T11:20:00.000Z',
    data_alvo_finalizacao: '2026-11-12T23:59:00.000Z',
    descricao:
      'Poste apagado em frente ao número 180, desde a semana passada. O trecho fica escuro à noite.',
    bairro: 'Botafogo',
    logradouro: 'Rua Voluntários da Pátria',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-09-12T11:20:00.000Z',
        tipo: 'Solicitação recebida',
        descricao:
          'O chamado foi registrado e encaminhado ao órgão responsável.',
        fl_publico: 1,
      },
      {
        data: '2026-10-01T09:00:00.000Z',
        tipo: 'Nota interna',
        descricao: 'Nota interna da equipe, sem publicação.',
        fl_publico: 0,
      },
      {
        data: '2026-10-28T15:40:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'A equipe de iluminação está programada para o reparo.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469002',
    protocolo: PROTOCOLO_DONO_SGRC,
    cpf: CPF_DONO_SGRC,
    categoria: 'Conservação',
    tipo: 'Poda',
    subtipo: 'Árvore em via',
    status: 'Aberto',
    nome_unidade_organizacional: 'Comlurb',
    data_inicio: '2026-10-02T09:05:00.000Z',
    data_alvo_finalizacao: '2026-11-20T23:59:00.000Z',
    descricao: 'Galhos baixos sobre a calçada, perto do ponto de ônibus.',
    bairro: 'Botafogo',
    logradouro: 'Rua Voluntários da Pátria',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-02T09:05:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'O pedido de poda entrou na fila do órgão.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17468810',
    protocolo: PROTOCOLO_DONO_CONCLUIDO_SGRC,
    cpf: CPF_DONO_SGRC,
    categoria: 'Conservação',
    tipo: 'Reparo',
    subtipo: 'Bueiro',
    status: 'Concluído',
    nome_unidade_organizacional: 'Rio-Águas',
    data_inicio: '2026-08-03T13:00:00.000Z',
    data_alvo_finalizacao: '2026-09-03T23:59:00.000Z',
    descricao: 'Tampa de bueiro solta na esquina, com risco para pedestres.',
    bairro: 'Copacabana',
    logradouro: 'Rua Barata Ribeiro',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-08-20T18:10:00.000Z',
        tipo: 'Concluído',
        descricao: 'A tampa foi substituída e o local foi liberado.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17467000',
    protocolo: PROTOCOLO_TERCEIRO_SGRC,
    cpf: CPF_TERCEIRO_SGRC,
    categoria: 'Água e esgoto',
    tipo: 'Reparo',
    subtipo: 'Vazamento',
    status: 'Em andamento',
    nome_unidade_organizacional: 'Rio-Águas',
    data_inicio: '2026-07-15T16:30:00.000Z',
    data_alvo_finalizacao: '2026-10-15T23:59:00.000Z',
    descricao: 'Vazamento de água na calçada, em frente à padaria.',
    bairro: 'Laranjeiras',
    logradouro: 'Rua das Laranjeiras',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-20T10:00:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'O vazamento foi localizado e o reparo está previsto.',
        fl_publico: 1,
      },
    ],
  },
  // ─── Chamados adicionais para CPF_DONO_SGRC (paginação) ───────────────────
  {
    id: '17469010',
    protocolo: 'RIO-30192847-3',
    cpf: CPF_DONO_SGRC,
    categoria: 'Limpeza urbana',
    tipo: 'Coleta',
    subtipo: 'Lixo acumulado',
    status: 'Aberto',
    nome_unidade_organizacional: 'Comlurb',
    data_inicio: '2026-10-15T08:00:00.000Z',
    data_alvo_finalizacao: '2026-11-15T23:59:00.000Z',
    descricao:
      'Acúmulo de lixo na calçada há mais de três dias, gerando mau cheiro e risco sanitário.',
    bairro: 'Tijuca',
    logradouro: 'Rua Conde de Bonfim',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-15T08:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado e encaminhado ao órgão.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469011',
    protocolo: 'RIO-40283756-4',
    cpf: CPF_DONO_SGRC,
    categoria: 'Trânsito',
    tipo: 'Semáforo',
    subtipo: 'Com defeito',
    status: 'Em andamento',
    nome_unidade_organizacional: 'CET-Rio',
    data_inicio: '2026-09-20T14:30:00.000Z',
    data_alvo_finalizacao: '2026-10-20T23:59:00.000Z',
    descricao:
      'Semáforo piscando em amarelo na esquina, causando risco de colisão.',
    bairro: 'Copacabana',
    logradouro: 'Av. Nossa Senhora de Copacabana',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-09-20T14:30:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Equipe técnica acionada para inspeção.',
        fl_publico: 1,
      },
      {
        data: '2026-10-05T10:00:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'Peça de reposição solicitada ao almoxarifado.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469012',
    protocolo: 'RIO-50394865-5',
    cpf: CPF_DONO_SGRC,
    categoria: 'Pavimentação',
    tipo: 'Reparo',
    subtipo: 'Buraco na via',
    status: 'Em andamento',
    nome_unidade_organizacional: 'SEOP',
    data_inicio: '2026-08-18T10:45:00.000Z',
    data_alvo_finalizacao: '2026-10-18T23:59:00.000Z',
    descricao: 'Buraco de grande extensão na pista, causando danos a veículos.',
    bairro: 'Flamengo',
    logradouro: 'Rua Marques de Abrantes',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-08-18T10:45:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado.',
        fl_publico: 1,
      },
      {
        data: '2026-09-10T09:00:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'Equipe de tapa-buraco agendada para a semana.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469013',
    protocolo: 'RIO-60485974-6',
    cpf: CPF_DONO_SGRC,
    categoria: 'Parques e jardins',
    tipo: 'Manutenção',
    subtipo: 'Praça degradada',
    status: 'Concluído',
    nome_unidade_organizacional: 'SMAC',
    data_inicio: '2026-07-01T09:00:00.000Z',
    data_alvo_finalizacao: '2026-08-01T23:59:00.000Z',
    descricao: 'Bancos quebrados e gramado sem manutenção há meses.',
    bairro: 'Leblon',
    logradouro: 'Praça Antero de Quental',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-07-01T09:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Solicitação de manutenção registrada.',
        fl_publico: 1,
      },
      {
        data: '2026-07-28T16:00:00.000Z',
        tipo: 'Concluído',
        descricao: 'Praça reformada, bancos substituídos e gramado cortado.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469014',
    protocolo: 'RIO-70576083-7',
    cpf: CPF_DONO_SGRC,
    categoria: 'Obras',
    tipo: 'Fiscalização',
    subtipo: 'Construção irregular',
    status: 'Cancelado',
    nome_unidade_organizacional: 'SMU',
    data_inicio: '2026-06-10T11:00:00.000Z',
    descricao:
      'Obra sem placa de alvará visível, funcionando aos fins de semana.',
    bairro: 'Méier',
    logradouro: 'Rua Dias da Cruz',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-06-10T11:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Fiscalização solicitada.',
        fl_publico: 1,
      },
      {
        data: '2026-07-05T14:30:00.000Z',
        tipo: 'Cancelado',
        descricao: 'Obra regularizada pelo proprietário antes da vistoria.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469015',
    protocolo: 'RIO-80667192-8',
    cpf: CPF_DONO_SGRC,
    categoria: 'Saúde',
    tipo: 'Dedetização',
    subtipo: 'Controle de pragas',
    status: 'Concluído',
    nome_unidade_organizacional: 'SMS',
    data_inicio: '2026-05-20T08:30:00.000Z',
    data_alvo_finalizacao: '2026-06-20T23:59:00.000Z',
    descricao:
      'Infestação de baratas e ratos no condomínio, com risco à saúde dos moradores.',
    bairro: 'Madureira',
    logradouro: 'Rua Conselheiro Galvão',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-05-20T08:30:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado encaminhado à vigilância sanitária.',
        fl_publico: 1,
      },
      {
        data: '2026-06-12T10:00:00.000Z',
        tipo: 'Concluído',
        descricao: 'Dedetização realizada em toda a área comum do condomínio.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469016',
    protocolo: 'RIO-90758201-9',
    cpf: CPF_DONO_SGRC,
    categoria: 'Drenagem',
    tipo: 'Reparo',
    subtipo: 'Galeria entupida',
    status: 'Em andamento',
    nome_unidade_organizacional: 'Rio-Águas',
    data_inicio: '2026-10-22T07:15:00.000Z',
    data_alvo_finalizacao: '2026-11-22T23:59:00.000Z',
    descricao:
      'Galeria pluvial entupida causando alagamento na rua a cada chuva.',
    bairro: 'Ipanema',
    logradouro: 'Rua Vinícius de Moraes',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-22T07:15:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Equipe de limpeza de galerias acionada.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469017',
    protocolo: 'RIO-11849310-0',
    cpf: CPF_DONO_SGRC,
    categoria: 'Ruído',
    tipo: 'Perturbação',
    subtipo: 'Sossego noturno',
    status: 'Aberto',
    nome_unidade_organizacional: 'SEOP',
    data_inicio: '2026-11-01T22:00:00.000Z',
    descricao: 'Bar sem licença funcionando após meia-noite com som alto.',
    bairro: 'Vila Isabel',
    logradouro: 'Blvd. 28 de Setembro',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-11-01T22:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado para fiscalização noturna.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469018',
    protocolo: 'RIO-21930429-1',
    cpf: CPF_DONO_SGRC,
    categoria: 'Fiscalização',
    tipo: 'Comércio',
    subtipo: 'Ocupação irregular',
    status: 'Em andamento',
    nome_unidade_organizacional: 'SMF',
    data_inicio: '2026-09-05T10:00:00.000Z',
    data_alvo_finalizacao: '2026-11-05T23:59:00.000Z',
    descricao:
      'Barraca sem licença ocupando parte da calçada e bloqueando a passagem.',
    bairro: 'Campo Grande',
    logradouro: 'Rua Cônego Vasconcelos',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-09-05T10:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado encaminhado à fiscalização de posturas.',
        fl_publico: 1,
      },
      {
        data: '2026-10-01T14:00:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'Notificação emitida ao comerciante.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469019',
    protocolo: 'RIO-32021538-2',
    cpf: CPF_DONO_SGRC,
    categoria: 'Transporte',
    tipo: 'Infraestrutura',
    subtipo: 'Parada danificada',
    status: 'Concluído',
    nome_unidade_organizacional: 'SMTR',
    data_inicio: '2026-07-28T09:30:00.000Z',
    data_alvo_finalizacao: '2026-08-28T23:59:00.000Z',
    descricao:
      'Cobertura da parada de ônibus destruída, deixando passageiros expostos à chuva.',
    bairro: 'Barra da Tijuca',
    logradouro: 'Av. das Américas',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-07-28T09:30:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado e encaminhado.',
        fl_publico: 1,
      },
      {
        data: '2026-08-20T11:00:00.000Z',
        tipo: 'Concluído',
        descricao: 'Cobertura da parada substituída.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469020',
    protocolo: 'RIO-43112647-3',
    cpf: CPF_DONO_SGRC,
    categoria: 'Iluminação pública',
    tipo: 'Reparo',
    subtipo: 'Poste apagado',
    status: 'Em andamento',
    nome_unidade_organizacional: 'RIOLUZ',
    data_inicio: '2026-11-05T20:00:00.000Z',
    data_alvo_finalizacao: '2026-11-25T23:59:00.000Z',
    descricao: 'Trecho de rua completamente sem iluminação há quatro noites.',
    bairro: 'Penha',
    logradouro: 'Rua Paiva Teles',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-11-05T20:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado e enviado à RIOLUZ.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469021',
    protocolo: 'RIO-54203756-4',
    cpf: CPF_DONO_SGRC,
    categoria: 'Limpeza urbana',
    tipo: 'Entulho',
    subtipo: 'Descarte irregular',
    status: 'Aberto',
    nome_unidade_organizacional: 'Comlurb',
    data_inicio: '2026-10-30T07:00:00.000Z',
    descricao:
      'Grande quantidade de entulho de obra descartada na via pública.',
    bairro: 'Jacarepaguá',
    logradouro: 'Estrada do Itanhangá',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-30T07:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado encaminhado à equipe de remoção de entulho.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469022',
    protocolo: 'RIO-65294865-5',
    cpf: CPF_DONO_SGRC,
    categoria: 'Trânsito',
    tipo: 'Sinalização',
    subtipo: 'Placa apagada',
    status: 'Concluído',
    nome_unidade_organizacional: 'CET-Rio',
    data_inicio: '2026-06-15T14:00:00.000Z',
    data_alvo_finalizacao: '2026-07-15T23:59:00.000Z',
    descricao: 'Placa de velocidade máxima desbotada e ilegível.',
    bairro: 'Tijuca',
    logradouro: 'Rua Haddock Lobo',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-06-15T14:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado.',
        fl_publico: 1,
      },
      {
        data: '2026-07-10T10:00:00.000Z',
        tipo: 'Concluído',
        descricao: 'Placa substituída pela equipe de sinalização.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469023',
    protocolo: 'RIO-76385974-6',
    cpf: CPF_DONO_SGRC,
    categoria: 'Pavimentação',
    tipo: 'Reparo',
    subtipo: 'Calçada danificada',
    status: 'Em andamento',
    nome_unidade_organizacional: 'SEOP',
    data_inicio: '2026-09-25T09:00:00.000Z',
    data_alvo_finalizacao: '2026-11-25T23:59:00.000Z',
    descricao:
      'Calçada esburacada e irregular, dificultando o acesso de pessoas com mobilidade reduzida.',
    bairro: 'São Cristóvão',
    logradouro: 'Rua São Luís Gonzaga',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-09-25T09:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado encaminhado à SEOP.',
        fl_publico: 1,
      },
      {
        data: '2026-10-20T08:00:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'Vistoria técnica realizada, reparo agendado.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469024',
    protocolo: 'RIO-87476083-7',
    cpf: CPF_DONO_SGRC,
    categoria: 'Parques e jardins',
    tipo: 'Poda',
    subtipo: 'Árvore caída',
    status: 'Concluído',
    nome_unidade_organizacional: 'SMAC',
    data_inicio: '2026-08-10T06:30:00.000Z',
    data_alvo_finalizacao: '2026-08-17T23:59:00.000Z',
    descricao: 'Árvore caída após tempestade bloqueando a rua inteiramente.',
    bairro: 'Engenho Novo',
    logradouro: 'Rua Ana Barbosa',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-08-10T06:30:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Equipe de emergência acionada.',
        fl_publico: 1,
      },
      {
        data: '2026-08-10T14:00:00.000Z',
        tipo: 'Concluído',
        descricao: 'Árvore removida e via liberada.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469025',
    protocolo: 'RIO-98567192-8',
    cpf: CPF_DONO_SGRC,
    categoria: 'Obras',
    tipo: 'Fiscalização',
    subtipo: 'Obra irregular',
    status: 'Em andamento',
    nome_unidade_organizacional: 'SMU',
    data_inicio: '2026-10-08T11:00:00.000Z',
    data_alvo_finalizacao: '2026-11-20T23:59:00.000Z',
    descricao:
      'Obra de ampliação sem alvará visível, gerando entulho na calçada.',
    bairro: 'Realengo',
    logradouro: 'Estrada do Campinho',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-08T11:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado encaminhado à fiscalização de obras.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469026',
    protocolo: 'RIO-19658301-9',
    cpf: CPF_DONO_SGRC,
    categoria: 'Limpeza urbana',
    tipo: 'Pichação',
    subtipo: 'Remoção',
    status: 'Aberto',
    nome_unidade_organizacional: 'Comlurb',
    data_inicio: '2026-11-10T10:00:00.000Z',
    descricao:
      'Pichação extensa em muro de patrimônio histórico, necessitando remoção urgente.',
    bairro: 'Botafogo',
    logradouro: 'Rua São Clemente',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-11-10T10:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado e encaminhado.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469027',
    protocolo: 'RIO-20749410-0',
    cpf: CPF_DONO_SGRC,
    categoria: 'Trânsito',
    tipo: 'Sinalização',
    subtipo: 'Faixa apagada',
    status: 'Em andamento',
    nome_unidade_organizacional: 'CET-Rio',
    data_inicio: '2026-10-18T13:00:00.000Z',
    data_alvo_finalizacao: '2026-11-18T23:59:00.000Z',
    descricao:
      'Faixa de pedestres completamente apagada, sem visibilidade para motoristas.',
    bairro: 'Méier',
    logradouro: 'Rua Dias da Cruz',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-10-18T13:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado registrado.',
        fl_publico: 1,
      },
      {
        data: '2026-11-02T09:00:00.000Z',
        tipo: 'Em atendimento',
        descricao: 'Recomposição de faixas agendada para a próxima semana.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469028',
    protocolo: 'RIO-31840529-1',
    cpf: CPF_DONO_SGRC,
    categoria: 'Drenagem',
    tipo: 'Reparo',
    subtipo: 'Alagamento recorrente',
    status: 'Concluído',
    nome_unidade_organizacional: 'Rio-Águas',
    data_inicio: '2026-04-12T08:00:00.000Z',
    data_alvo_finalizacao: '2026-06-12T23:59:00.000Z',
    descricao: 'Rua alaga a cada chuva por galeria subdimensionada.',
    bairro: 'Bangu',
    logradouro: 'Rua Frei Gaspar',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-04-12T08:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Chamado encaminhado à Rio-Águas.',
        fl_publico: 1,
      },
      {
        data: '2026-05-30T16:00:00.000Z',
        tipo: 'Concluído',
        descricao: 'Galeria ampliada e bocas-de-lobo desobstruídas.',
        fl_publico: 1,
      },
    ],
  },
  {
    id: '17469029',
    protocolo: 'RIO-42931638-2',
    cpf: CPF_DONO_SGRC,
    categoria: 'Iluminação pública',
    tipo: 'Reparo',
    subtipo: 'Cabo elétrico solto',
    status: 'Em andamento',
    nome_unidade_organizacional: 'RIOLUZ',
    data_inicio: '2026-11-12T17:00:00.000Z',
    data_alvo_finalizacao: '2026-11-26T23:59:00.000Z',
    descricao:
      'Cabo elétrico pendendo sobre a calçada após ventania, representando risco de choque.',
    bairro: 'Flamengo',
    logradouro: 'Rua Pinheiro Guimarães',
    loaded_at: CARGA,
    andamentos: [
      {
        data: '2026-11-12T17:00:00.000Z',
        tipo: 'Solicitação recebida',
        descricao: 'Equipe de emergência da RIOLUZ acionada.',
        fl_publico: 1,
      },
    ],
  },
]

const PROTOCOLOS_MOCK = new Set(
  CHAMADOS.map(chamado => chamado.protocolo.toUpperCase())
)

export function ehProtocoloSgrcMock(protocolo: string): boolean {
  return PROTOCOLOS_MOCK.has(protocolo.trim().toUpperCase())
}

function porAbertura(chamados: ChamadoSgrc[]): ChamadoSgrc[] {
  return [...chamados].sort((a, b) =>
    b.data_inicio.localeCompare(a.data_inicio)
  )
}

function andamentosPublicos(chamado: ChamadoSgrc): AndamentoSgrc[] {
  return chamado.andamentos
    .filter(andamento => andamento.fl_publico === 1)
    .sort((a, b) => a.data.localeCompare(b.data))
}

function ultimoPublico(chamado: ChamadoSgrc): AndamentoSgrc | undefined {
  return [...andamentosPublicos(chamado)].sort((a, b) =>
    b.data.localeCompare(a.data)
  )[0]
}

function andamentoTela(andamento: AndamentoSgrc) {
  return {
    evento: andamento.tipo,
    dataInsercao: andamento.data,
    descricao: andamento.descricao,
  }
}

interface OrdemTela {
  codigoOs: string
  servico: string
  subtema: string
  categoria: string
  status: string
  dataAbertura: string
  previsaoSLA?: string
  descricao?: string
  endereco?: { logradouro?: string; bairro?: string }
  orgaoResponsavel?: { nome: string }
  andamentos?: { evento: string; dataInsercao: string; descricao: string }[]
  ultimoAndamento?: { evento: string; dataInsercao: string; descricao: string }
  isAcessoInformacao: false
}

function ordemDe(
  chamado: ChamadoSgrc,
  modo: 'dono' | 'publico' | 'lista'
): OrdemTela {
  const ordem: OrdemTela = {
    codigoOs: chamado.id,
    servico: chamado.subtipo || chamado.tipo || chamado.categoria,
    subtema: chamado.tipo,
    categoria: chamado.categoria,
    status: chamado.status,
    dataAbertura: chamado.data_inicio,
    isAcessoInformacao: false,
  }
  if (chamado.data_alvo_finalizacao) {
    ordem.previsaoSLA = chamado.data_alvo_finalizacao
  }
  if (chamado.nome_unidade_organizacional) {
    ordem.orgaoResponsavel = { nome: chamado.nome_unidade_organizacional }
  }
  if (modo === 'lista') return ordem

  if (modo === 'dono') {
    ordem.descricao = chamado.descricao
    ordem.endereco = {
      logradouro: chamado.logradouro,
      bairro: chamado.bairro,
    }
    const andamentos = andamentosPublicos(chamado).map(andamentoTela)
    if (andamentos.length > 0) ordem.andamentos = andamentos
    return ordem
  }

  ordem.endereco = { bairro: chamado.bairro }
  const ultimo = ultimoPublico(chamado)
  if (ultimo) ordem.ultimoAndamento = andamentoTela(ultimo)
  return ordem
}

interface ProtocoloTela {
  protocolo: string
  status: string
  dataAbertura: string
  dataUltimaAtualizacao: string
  loaded_at: string
  ordens_de_servico: OrdemTela[]
}

function agrupar(
  chamados: ChamadoSgrc[],
  modo: 'dono' | 'publico' | 'lista'
): ProtocoloTela[] {
  const grupos = new Map<string, ProtocoloTela>()
  const ordem: string[] = []

  for (const chamado of chamados) {
    let protocolo = grupos.get(chamado.protocolo)
    if (!protocolo) {
      const ultimo = ultimoPublico(chamado)
      protocolo = {
        protocolo: chamado.protocolo,
        status: chamado.status,
        dataAbertura: chamado.data_inicio,
        dataUltimaAtualizacao: ultimo?.data ?? chamado.data_inicio,
        loaded_at: chamado.loaded_at,
        ordens_de_servico: [],
      }
      grupos.set(chamado.protocolo, protocolo)
      ordem.push(chamado.protocolo)
    }
    protocolo.ordens_de_servico.push(ordemDe(chamado, modo))
  }

  return ordem.flatMap(chave => {
    const protocolo = grupos.get(chave)
    return protocolo ? [protocolo] : []
  })
}

export function listarSgrcMock() {
  const doDono = porAbertura(
    CHAMADOS.filter(chamado => chamado.cpf === CPF_DONO_SGRC)
  )
  return { protocolos: agrupar(doDono, 'lista') }
}

export function detalheSgrcMock(protocolo: string, modo: 'dono' | 'publico') {
  const valor = protocolo.trim().toUpperCase()
  const chamados = porAbertura(
    CHAMADOS.filter(chamado => chamado.protocolo.toUpperCase() === valor)
  )
  if (chamados.length === 0) return null
  if (
    modo === 'dono' &&
    chamados.some(chamado => chamado.cpf !== CPF_DONO_SGRC)
  ) {
    return null
  }
  return agrupar(chamados, modo)[0] ?? null
}
