export type MeiCompanyStatus = 'Ativa' | 'Suspensa' | 'Inapta' | 'Baixada' | 'Nula'

export interface MeiCnae {
  codigo: string
  descricao: string
}

export interface MeiCompanyFullData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  situacaoCadastral: MeiCompanyStatus
  telefone: {
    ddi: string
    ddd: string
    valor: string
  }
  email: string
  naturezaJuridica: string
  cnaePrincipal: MeiCnae
  cnaesSecundarios: MeiCnae[]
}
