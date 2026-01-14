import type { CourseUserInfo } from '../../../types'

export const completeUserInfo: CourseUserInfo = {
  cpf: '12345678901',
  name: 'João Silva',
  email: {
    principal: {
      valor: 'joao.silva@example.com',
    },
  },
  phone: {
    principal: {
      ddi: '55',
      ddd: '21',
      valor: '999999999',
    },
  },
  address: {
    logradouro: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    municipio: 'Rio de Janeiro',
    estado: 'RJ',
    tipo_logradouro: 'Rua',
    complemento: 'Apto 101',
    cep: '20000-000',
  },
  genero: 'masculino',
  escolaridade: 'superior_completo',
  renda_familiar: 'de_2_a_4_salarios',
  deficiencia: 'nenhuma',
  nascimento: {
    data: '1990-01-15',
  },
  raca: 'branca',
}

export const incompleteUserInfo: CourseUserInfo = {
  cpf: '98765432100',
  name: 'Maria Oliveira',
  email: {
    principal: {
      valor: null,
    },
  },
  phone: {
    principal: {
      ddi: null,
      ddd: null,
      valor: null,
    },
  },
  address: null,
  genero: undefined,
  escolaridade: undefined,
  renda_familiar: undefined,
  deficiencia: undefined,
  nascimento: undefined,
  raca: undefined,
}

export const userAuthInfo = {
  cpf: '12345678901',
  name: 'João Silva',
}

export const userAuthInfoIncomplete = {
  cpf: '98765432100',
  name: 'Maria Oliveira',
}
