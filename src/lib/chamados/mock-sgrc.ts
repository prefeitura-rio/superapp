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
