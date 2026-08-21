/**
 * Mock data for chamados — only active when NEXT_PUBLIC_USE_MOCK_CHAMADOS=true (staging).
 *
 * Three protocols covering all UI scenarios:
 *   RIO-MOCK-001 — two OSs (tests consulta-protocolo multi-card list)
 *   RIO-MOCK-002 — single OS, Concluído, full andamentos + address (tests full timeline)
 *   RIO-MOCK-003 — single OS, Aberto, no andamentos, no address (tests minimal state)
 */

// ─── Authenticated detail response shape ─────────────────────────────────────

export const MOCK_DETAIL: Record<string, object> = {
  'RIO-MOCK-001': {
    protocolo: 'RIO-MOCK-001',
    categoria: 'Atendimento realizado',
    subcategoria: 'Serviço',
    dataAbertura: '2026-06-01T08:00:00Z',
    dataUltimaAtualizacao: '2026-06-03T14:00:00Z',
    status: 'Em andamento',
    origem: 'Aplicativo Web',
    ordens_de_servico: [
      {
        codigoOs: '00000001',
        categoria: 'Solicitação',
        servico: 'Reparo de iluminação pública',
        tema: 'Cidade',
        subtema: 'Iluminação',
        orgaoResponsavel: { id: '1', nome: 'RIOLUZ', sigla: 'RIOLUZ' },
        orgaoResponsavelPai: null,
        dataAbertura: '2026-06-01T08:00:00Z',
        status: 'Em andamento',
        previsaoSLA: '2026-06-15T23:59:00Z',
        descricao: 'Poste sem luz na esquina da Rua das Flores com Av. Brasil.',
        endereco: {
          logradouro: 'Rua das Flores',
          numero: '100',
          complemento: '',
          bairro: 'Tijuca',
          cep: '20520-000',
          pontoReferencia: 'Esquina com Av. Brasil',
          tipoEndereco: 'Público',
        },
        andamentos: [
          {
            dataInsercao: '2026-06-01T08:00:00Z',
            status: 'Publicado',
            evento: 'Solicitação recebida',
            tipoEvento: 'Partial_Update',
            descricao: 'Sua solicitação foi registrada com sucesso.',
          },
          {
            dataInsercao: '2026-06-02T10:30:00Z',
            status: 'Publicado',
            evento: 'Em análise',
            tipoEvento: 'Partial_Update',
            descricao: 'A equipe técnica está analisando a ocorrência.',
          },
        ],
      },
      {
        codigoOs: '00000002',
        categoria: 'Solicitação',
        servico: 'Poda de árvore',
        tema: 'Meio Ambiente',
        subtema: 'Arborização',
        orgaoResponsavel: {
          id: '2',
          nome: 'Secretaria de Meio Ambiente',
          sigla: 'SMAC',
        },
        orgaoResponsavelPai: null,
        dataAbertura: '2026-06-01T08:00:00Z',
        status: 'Aberto',
        previsaoSLA: null,
        descricao: 'Árvore com galhos sobre a fiação elétrica.',
        endereco: {
          logradouro: 'Av. Maracanã',
          numero: '500',
          complemento: 'Em frente ao número',
          bairro: 'Maracanã',
          cep: '20271-110',
          pontoReferencia: 'Próximo ao estádio',
          tipoEndereco: 'Público',
        },
        andamentos: [
          {
            dataInsercao: '2026-06-01T08:00:00Z',
            status: 'Publicado',
            evento: 'Solicitação recebida',
            tipoEvento: 'Partial_Update',
            descricao: 'Solicitação de poda registrada.',
          },
        ],
      },
    ],
  },

  'RIO-MOCK-002': {
    protocolo: 'RIO-MOCK-002',
    categoria: 'Atendimento realizado',
    subcategoria: 'Serviço',
    dataAbertura: '2026-05-10T09:15:00Z',
    dataUltimaAtualizacao: '2026-05-20T16:45:00Z',
    status: 'Concluído',
    origem: 'Aplicativo Web',
    ordens_de_servico: [
      {
        codigoOs: '00000003',
        categoria: 'Solicitação',
        servico: 'Tapa-buraco',
        tema: 'Cidade',
        subtema: 'Conservação de vias',
        orgaoResponsavel: { id: '3', nome: 'SEOP', sigla: 'SEOP' },
        orgaoResponsavelPai: null,
        dataAbertura: '2026-05-10T09:15:00Z',
        status: 'Fechado',
        previsaoSLA: '2026-05-17T23:59:00Z',
        motivoFechamento: 'Fechado com solução',
        descricao: 'Buraco grande na pista causando risco aos veículos.',
        endereco: {
          logradouro: 'Rua Senador Dantas',
          numero: '75',
          complemento: 'Pista direita sentido centro',
          bairro: 'Centro',
          cep: '20031-201',
          pontoReferencia: 'Em frente ao Cine Odeon',
          tipoEndereco: 'Público',
        },
        andamentos: [
          {
            dataInsercao: '2026-05-10T09:15:00Z',
            status: 'Publicado',
            evento: 'Solicitação recebida',
            tipoEvento: 'Partial_Update',
            descricao: 'Solicitação de tapa-buraco registrada com sucesso.',
          },
          {
            dataInsercao: '2026-05-12T11:00:00Z',
            status: 'Publicado',
            evento: 'Em análise',
            tipoEvento: 'Partial_Update',
            descricao: 'Equipe de vistoria agendada para avaliação do local.',
          },
          {
            dataInsercao: '2026-05-14T14:30:00Z',
            status: 'Publicado',
            evento: 'Serviço agendado',
            tipoEvento: 'Partial_Update',
            descricao: 'Serviço de tapa-buraco agendado para os próximos dias.',
          },
          {
            dataInsercao: '2026-05-20T16:45:00Z',
            status: 'Publicado',
            evento: 'Fechado com solução',
            tipoEvento: 'Partial_Update',
            descricao:
              'Reparo concluído. O buraco foi preenchido e a via está em condições normais.',
          },
        ],
      },
    ],
  },

  'RIO-MOCK-003': {
    protocolo: 'RIO-MOCK-003',
    categoria: 'Atendimento realizado',
    subcategoria: 'Serviço',
    dataAbertura: '2026-07-29T10:00:00Z',
    dataUltimaAtualizacao: '2026-07-29T10:00:00Z',
    status: 'Aberto',
    origem: 'Aplicativo Web',
    ordens_de_servico: [
      {
        codigoOs: '00000004',
        categoria: 'Solicitação',
        servico: 'Coleta de entulho',
        tema: 'Cidade',
        subtema: 'Limpeza Urbana',
        orgaoResponsavel: null,
        orgaoResponsavelPai: null,
        dataAbertura: '2026-07-29T10:00:00Z',
        status: 'Aberto',
        previsaoSLA: null,
        descricao: '',
        endereco: null,
        andamentos: [],
      },
    ],
  },
}

// ─── Public detail response shape ────────────────────────────────────────────

export const MOCK_PUBLIC: Record<string, object> = {
  'RIO-MOCK-001': {
    protocolo: 'RIO-MOCK-001',
    status: 'Em andamento',
    dataAbertura: '2026-06-01T08:00:00Z',
    ordens_de_servico: [
      {
        codigoOs: '00000001',
        servico: 'Reparo de iluminação pública',
        subtema: 'Iluminação',
        status: 'Em andamento',
        orgaoResponsavel: { nome: 'RIOLUZ' },
        endereco: { logradouro: 'Rua das Flores', bairro: 'Tijuca' },
        ultimoAndamento: {
          evento: 'Em análise',
          dataInsercao: '2026-06-02T10:30:00Z',
          descricao: 'A equipe técnica está analisando a ocorrência.',
        },
      },
      {
        codigoOs: '00000002',
        servico: 'Poda de árvore',
        subtema: 'Arborização',
        status: 'Aberto',
        orgaoResponsavel: { nome: 'SMAC' },
        endereco: { logradouro: 'Av. Maracanã', bairro: 'Maracanã' },
        ultimoAndamento: {
          evento: 'Solicitação recebida',
          dataInsercao: '2026-06-01T08:00:00Z',
          descricao: 'Solicitação de poda registrada.',
        },
      },
    ],
  },

  'RIO-MOCK-002': {
    protocolo: 'RIO-MOCK-002',
    status: 'Concluído',
    dataAbertura: '2026-05-10T09:15:00Z',
    ordens_de_servico: [
      {
        codigoOs: '00000003',
        servico: 'Tapa-buraco',
        subtema: 'Conservação de vias',
        status: 'Fechado',
        orgaoResponsavel: { nome: 'SEOP' },
        endereco: { logradouro: 'Rua Senador Dantas', bairro: 'Centro' },
        ultimoAndamento: {
          evento: 'Fechado com solução',
          dataInsercao: '2026-05-20T16:45:00Z',
          descricao:
            'Reparo concluído. O buraco foi preenchido e a via está em condições normais.',
        },
      },
    ],
  },

  'RIO-MOCK-003': {
    protocolo: 'RIO-MOCK-003',
    status: 'Aberto',
    dataAbertura: '2026-07-29T10:00:00Z',
    ordens_de_servico: [
      {
        codigoOs: '00000004',
        servico: 'Coleta de entulho',
        subtema: 'Limpeza Urbana',
        status: 'Aberto',
        orgaoResponsavel: null,
        endereco: null,
        ultimoAndamento: null,
      },
    ],
  },
}

// ─── List response shape (minhas-solicitacoes) ────────────────────────────────

export const MOCK_LIST = {
  protocolos: [
    {
      protocolo: 'RIO-MOCK-001',
      subcategoria: 'Serviço',
      dataAbertura: '2026-06-01T08:00:00Z',
      dataUltimaAtualizacao: '2026-06-03T14:00:00Z',
      status: 'Em andamento',
      origem: 'Aplicativo Web',
      ordens_de_servico: [
        {
          codigoOs: '00000001',
          servico: 'Reparo de iluminação pública',
          subtema: 'Iluminação',
          dataAbertura: '2026-06-01T08:00:00Z',
          status: 'Em andamento',
        },
        {
          codigoOs: '00000002',
          servico: 'Poda de árvore',
          subtema: 'Arborização',
          dataAbertura: '2026-06-01T08:00:00Z',
          status: 'Aberto',
        },
      ],
    },
    {
      protocolo: 'RIO-MOCK-002',
      subcategoria: 'Serviço',
      dataAbertura: '2026-05-10T09:15:00Z',
      dataUltimaAtualizacao: '2026-05-20T16:45:00Z',
      status: 'Concluído',
      origem: 'Aplicativo Web',
      ordens_de_servico: [
        {
          codigoOs: '00000003',
          servico: 'Tapa-buraco',
          subtema: 'Conservação de vias',
          dataAbertura: '2026-05-10T09:15:00Z',
          status: 'Fechado',
        },
      ],
    },
    {
      protocolo: 'RIO-MOCK-003',
      subcategoria: 'Serviço',
      dataAbertura: '2026-07-29T10:00:00Z',
      dataUltimaAtualizacao: '2026-07-29T10:00:00Z',
      status: 'Aberto',
      origem: 'Aplicativo Web',
      ordens_de_servico: [
        {
          codigoOs: '00000004',
          servico: 'Coleta de entulho',
          subtema: 'Limpeza Urbana',
          dataAbertura: '2026-07-29T10:00:00Z',
          status: 'Aberto',
        },
      ],
    },
  ],
}

export const IS_MOCK_ENABLED =
  process.env.NEXT_PUBLIC_USE_MOCK_CHAMADOS === 'true'

export const MOCK_PROTOCOLS = Object.keys(MOCK_DETAIL)
