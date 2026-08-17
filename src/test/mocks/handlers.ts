import { http, HttpResponse } from 'msw'
import { TEST_ENV } from './env'

// API base URLs for handlers
const RMI_BASE_URL = TEST_ENV.BASE_API_URL_RMI
const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL
const DIVIDA_ATIVA_BASE_URL = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

// Default success responses
const DEFAULT_SUCCESS_RESPONSE = { message: 'Success' }

const MOCK_CURRICULO_COMPLETO = {
  formacoes: [],
  experiencias: [],
  idiomas: [],
  conquistas: [],
  cursos_complementares: [],
  situacao_interesses: undefined,
}

const MOCK_ESCOLARIDADES = {
  data: [
    { id: 'esc-1', descricao: 'Fundamental incompleto', ordem: 1 },
    { id: 'esc-2', descricao: 'Fundamental completo', ordem: 2 },
    { id: 'esc-3', descricao: 'Médio incompleto', ordem: 3 },
    { id: 'esc-4', descricao: 'Médio completo', ordem: 4 },
    { id: 'esc-5', descricao: 'Superior incompleto', ordem: 5 },
    { id: 'esc-6', descricao: 'Superior completo', ordem: 6 },
    { id: 'esc-7', descricao: 'Doutorado', ordem: 7 },
  ],
  meta: { page: 1, page_size: 100, total: 7 },
}

const MOCK_IDIOMAS = {
  data: [{ id: 'idioma-ingles', descricao: 'Inglês' }],
  meta: { page: 1, page_size: 100, total: 1 },
}

const MOCK_NIVEIS_IDIOMA = {
  data: [
    { id: 'nivel-basico', descricao: 'Básico', ordem: 1 },
    { id: 'nivel-intermediario', descricao: 'Intermediário', ordem: 2 },
    { id: 'nivel-avancado', descricao: 'Avançado', ordem: 3 },
  ],
  meta: { page: 1, page_size: 100, total: 3 },
}

export const MOCK_VAGA_SEM_CRITERIOS = {
  id: 'vaga-abc-123',
  titulo: 'Vaga Teste',
  idade_minima: null,
  id_escolaridade_minima: null,
  idiomas_requisito: [],
}

// Dívida Ativa — payloads no formato do contrato provisório (`divida-ativa-api.yaml`).
// As premissas de formato estão em `docs/divida-ativa.md`. Estes mocks são o caminho feliz;
// estados vazio, de erro e de borda devem ser montados por teste com `server.use()`.
export const MOCK_IMOVEL_DIVIDA_ATIVA = {
  inscricaoImobiliaria: '05217663',
  endereco: 'Rua Barata Ribeiro, 586 - A 501',
  bairro: 'Copacabana',
  proprietario: 'Bruno Rocha Menezes',
  possuiDebitos: true,
  cadastradoEm: '2026-08-04T13:45:00-03:00',
}

export const MOCK_DEBITO_DIVIDA_ATIVA = {
  numeroCda: '2023/0012345-6',
  exercicio: 2023,
  tributo: 'IPTU',
  situacao: 'EM_ABERTO',
  parcelavel: true,
  dataVencimento: '2023-03-10',
  valorPrincipal: 1250.35,
  valorAtualizado: 1890.72,
  dataReferenciaValor: '2026-08-04',
}

export const MOCK_SIMULACAO_DIVIDA_ATIVA = {
  inscricaoImobiliaria: '01234567890',
  validaAte: '2026-08-04T23:59:59-03:00',
  condicoes: [
    {
      quantidadeParcelas: 12,
      valorEntrada: 300.0,
      valorParcela: 145.89,
      valorTotal: 2050.68,
      percentualDesconto: 0,
      vencimentoPrimeiraParcela: '2026-09-10',
    },
  ],
}

export const MOCK_REQUERIMENTO_DIVIDA_ATIVA = {
  protocolo: '2026000123456',
  situacao: 'EM_ANALISE',
  inscricaoImobiliaria: '01234567890',
  quantidadeParcelas: 12,
  valorTotal: 2050.68,
  abertoEm: '2026-08-04T13:45:00-03:00',
  atualizadoEm: '2026-08-05T09:12:00-03:00',
  // `motivoIndeferimento` é omitido de propósito: só vem quando a situação é INDEFERIDO.
}

export const handlers = [
  // RMI - Citizen profile
  http.get(`${RMI_BASE_URL}/v1/citizen/:cpf`, () => {
    return HttpResponse.json(
      { nascimento: { data: '1990-01-01' } },
      { status: 200 }
    )
  }),

  // RMI - Update phone
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/phone`, () => {
    return HttpResponse.json(DEFAULT_SUCCESS_RESPONSE, { status: 200 })
  }),

  // RMI - Validate phone token
  http.post(`${RMI_BASE_URL}/v1/citizen/:cpf/phone/validate`, () => {
    return HttpResponse.json({ validated: true }, { status: 200 })
  }),

  // RMI - Update email
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/email`, () => {
    return HttpResponse.json(DEFAULT_SUCCESS_RESPONSE, { status: 200 })
  }),

  // RMI - Update address
  http.put(`${RMI_BASE_URL}/v1/citizen/:cpf/address`, () => {
    return HttpResponse.json(DEFAULT_SUCCESS_RESPONSE, { status: 200 })
  }),

  // Courses - Enrollment
  http.post(`${COURSES_BASE_URL}/api/v1/courses/:id/enrollments`, () => {
    return HttpResponse.json(
      { id: 'enrollment-123', status: 'enrolled' },
      { status: 201 }
    )
  }),

  // MEI - Submit proposal
  http.post(
    `${COURSES_BASE_URL}/api/v1/oportunidades-mei/:id/propostas`,
    () => {
      return HttpResponse.json(
        { id: 'proposal-123', status: 'submitted' },
        { status: 201 }
      )
    }
  ),

  // Empregabilidade - Currículo por CPF
  http.get(`${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/:cpf`, () => {
    return HttpResponse.json(MOCK_CURRICULO_COMPLETO, { status: 200 })
  }),

  // Empregabilidade - Vaga pública por ID
  http.get(`${COURSES_BASE_URL}/api/public/empregabilidade/vagas/:id`, () => {
    return HttpResponse.json(MOCK_VAGA_SEM_CRITERIOS, { status: 200 })
  }),

  // Empregabilidade - Escolaridades
  http.get(`${COURSES_BASE_URL}/api/v1/empregabilidade/escolaridades`, () => {
    return HttpResponse.json(MOCK_ESCOLARIDADES, { status: 200 })
  }),

  // Empregabilidade - Idiomas
  http.get(`${COURSES_BASE_URL}/api/v1/empregabilidade/idiomas`, () => {
    return HttpResponse.json(MOCK_IDIOMAS, { status: 200 })
  }),

  // Empregabilidade - Níveis de idioma
  http.get(`${COURSES_BASE_URL}/api/v1/empregabilidade/niveis-idioma`, () => {
    return HttpResponse.json(MOCK_NIVEIS_IDIOMA, { status: 200 })
  }),

  // Empregabilidade - Criar candidatura
  http.post(`${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`, () => {
    return HttpResponse.json({ id: 'candidatura-123' }, { status: 201 })
  }),

  // Dívida Ativa - Listar imóveis do cidadão
  http.get(`${DIVIDA_ATIVA_BASE_URL}/v1/imoveis`, () => {
    return HttpResponse.json(
      { data: [MOCK_IMOVEL_DIVIDA_ATIVA] },
      { status: 200 }
    )
  }),

  // Dívida Ativa - Cadastrar imóvel
  http.post(`${DIVIDA_ATIVA_BASE_URL}/v1/imoveis`, () => {
    return HttpResponse.json(MOCK_IMOVEL_DIVIDA_ATIVA, { status: 201 })
  }),

  // Dívida Ativa - Consulta prévia da inscrição no sistema fiscal (não cadastra)
  http.get(
    `${DIVIDA_ATIVA_BASE_URL}/v1/imoveis/consulta/:inscricaoImobiliaria`,
    () => {
      return HttpResponse.json(MOCK_IMOVEL_DIVIDA_ATIVA, { status: 200 })
    }
  ),

  // Dívida Ativa - Detalhe do imóvel
  http.get(`${DIVIDA_ATIVA_BASE_URL}/v1/imoveis/:inscricaoImobiliaria`, () => {
    return HttpResponse.json(MOCK_IMOVEL_DIVIDA_ATIVA, { status: 200 })
  }),

  // Dívida Ativa - Excluir imóvel
  http.delete(
    `${DIVIDA_ATIVA_BASE_URL}/v1/imoveis/:inscricaoImobiliaria`,
    () => {
      return new HttpResponse(null, { status: 204 })
    }
  ),

  // Dívida Ativa - Débitos (CDAs) do imóvel
  http.get(
    `${DIVIDA_ATIVA_BASE_URL}/v1/imoveis/:inscricaoImobiliaria/debitos`,
    () => {
      return HttpResponse.json(
        {
          data: [MOCK_DEBITO_DIVIDA_ATIVA],
          // Somado pela API, nunca pelo front (premissa P13).
          valorTotalAtualizado: 1890.72,
        },
        { status: 200 }
      )
    }
  ),

  // Dívida Ativa - Simular parcelamento
  http.post(`${DIVIDA_ATIVA_BASE_URL}/v1/parcelamentos/simulacoes`, () => {
    return HttpResponse.json(MOCK_SIMULACAO_DIVIDA_ATIVA, { status: 200 })
  }),

  // Dívida Ativa - Enviar documento do requerimento
  http.post(`${DIVIDA_ATIVA_BASE_URL}/v1/requerimentos/documentos`, () => {
    return HttpResponse.json(
      {
        documentoId: 'doc-8f2c1b90',
        tipo: 'DOCUMENTO_IDENTIDADE',
        nomeArquivo: 'identidade.pdf',
      },
      { status: 201 }
    )
  }),

  // Dívida Ativa - Abrir requerimento
  http.post(`${DIVIDA_ATIVA_BASE_URL}/v1/requerimentos`, () => {
    return HttpResponse.json(MOCK_REQUERIMENTO_DIVIDA_ATIVA, { status: 201 })
  }),

  // Dívida Ativa - Listar requerimentos do cidadão
  http.get(`${DIVIDA_ATIVA_BASE_URL}/v1/requerimentos`, () => {
    return HttpResponse.json(
      { data: [MOCK_REQUERIMENTO_DIVIDA_ATIVA] },
      { status: 200 }
    )
  }),

  // Dívida Ativa - Detalhe do requerimento por protocolo
  http.get(`${DIVIDA_ATIVA_BASE_URL}/v1/requerimentos/:protocolo`, () => {
    return HttpResponse.json(MOCK_REQUERIMENTO_DIVIDA_ATIVA, { status: 200 })
  }),

  // Dívida Ativa - Comprovante em PDF (blob, tratado pelo mutator)
  http.get(
    `${DIVIDA_ATIVA_BASE_URL}/v1/requerimentos/:protocolo/comprovante`,
    () => {
      return new HttpResponse(new Blob(['%PDF-1.4 mock']), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })
    }
  ),

  // Dívida Ativa - Cancelar requerimento
  http.post(
    `${DIVIDA_ATIVA_BASE_URL}/v1/requerimentos/:protocolo/cancelamento`,
    () => {
      return HttpResponse.json(
        { ...MOCK_REQUERIMENTO_DIVIDA_ATIVA, situacao: 'CANCELADO' },
        { status: 200 }
      )
    }
  ),
]
