import type { MeiCompanyFullData } from './types'

// TODO: Replace with actual API call
export async function getMeiCompanyData(): Promise<MeiCompanyFullData | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Mock data - return null to test fallback state
  return {
    cnpj: '12.345.678/0001-95',
    razaoSocial: 'NOVA ERA TECNOLOGIA E SERVIÇOS LTDA',
    nomeFantasia: 'TECHNOVA',
    situacaoCadastral: 'Ativa',
    telefone: { ddi: '55', ddd: '21', valor: '99866-5327' },
    email: 'marina.duarte@gmail.com',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    cnaePrincipal: {
      codigo: '315-3',
      descricao: 'Desenvolvimento de programas de computador sob encomenda',
    },
    cnaesSecundarios: [
      {
        codigo: '62.09-1/00',
        descricao: 'Serviços combinados de escritório e apoio administrativo',
      },
      {
        codigo: '74.90-1/04',
        descricao: 'Atividades de produção de fotografias',
      },
    ],
  }
}
