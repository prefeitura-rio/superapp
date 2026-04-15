import type { EmpregabilidadeEmpresa } from '@/http-courses/models'

export interface EmpresaDetail {
  cnpj: string
  nome: string
  logo?: string
  sobre: string
  site?: string
  setor: string
  tamanho: string
  especializacoes: string
}

/**
 * Transforma EmpregabilidadeEmpresa da API em EmpresaDetail
 */
export function mapEmpregabilidadeEmpresaToDetail(
  empresa: EmpregabilidadeEmpresa
): EmpresaDetail {
  return {
    cnpj: empresa.cnpj || '',
    nome: empresa.nome_fantasia || empresa.razao_social || 'Empresa',
    logo: empresa.url_logo,
    sobre: empresa.descricao || 'Sem descrição disponível',
    site: empresa.website,
    setor: empresa.setor || 'Não informado',
    tamanho: empresa.porte || 'Não informado',
    // Especializações não vem da API, usando valor padrão
    especializacoes: 'Não informado',
  }
}
