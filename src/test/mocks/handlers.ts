import { http, HttpResponse } from 'msw'
import { TEST_ENV } from './env'

// API base URLs for handlers
const RMI_BASE_URL = TEST_ENV.BASE_API_URL_RMI
const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

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
]
