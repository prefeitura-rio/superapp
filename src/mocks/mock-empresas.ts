import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import { MOCK_VAGAS } from './mock-vagas'

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

function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

const MOCK_EMPRESAS: EmpresaDetail[] = [
  {
    cnpj: '60746948000112',
    nome: 'Odebrecht Engenharia e Construção',
    sobre:
      'A Odebrecht atua em obras de construção pesada e infraestrutura no Brasil e no exterior. A empresa está presente em grandes obras e projetos de infraestrutura, com foco em empreendimentos de grande porte e alta complexidade logística, de construção e de engenharia. Destaque na construção de usinas hidrelétricas e atuação nos segmentos de indústria (mineração), petróleo e gás, rodovias, portos, transporte de massa e saneamento.',
    site: 'https://odebrecht.com.br',
    setor: 'Construção e Engenharia',
    tamanho: '+ de 10.000 funcionários',
    especializacoes:
      'Construção Civil, Empreendimentos imobiliários, Loteamentos, Engenharia, Infraestrutura, Obras',
  },
  {
    cnpj: '41442565000180',
    nome: 'Prefeitura Municipal do Rio de Janeiro',
    sobre:
      'A Prefeitura do Rio de Janeiro é o órgão executivo do município, responsável pela gestão da cidade e pela oferta de serviços públicos à população carioca. Atua em áreas como educação, saúde, mobilidade urbana, cultura, turismo e desenvolvimento econômico.',
    site: 'https://prefeitura.rio',
    setor: 'Administração Pública',
    tamanho: '+ de 10.000 funcionários',
    especializacoes:
      'Gestão pública, Turismo, Cultura, Educação, Saúde, Mobilidade urbana',
  },
  {
    cnpj: '33000167000101',
    nome: 'Petrobrás S.A.',
    sobre:
      'A Petrobras é uma empresa de energia que atua na exploração, produção, refino e comercialização de petróleo e derivados. Líder no setor de óleo e gás no Brasil, atua também em biocombustíveis, energia e petroquímica.',
    site: 'https://petrobras.com.br',
    setor: 'Petróleo e Gás',
    tamanho: '+ de 10.000 funcionários',
    especializacoes:
      'Exploração e produção, Refino, Petroquímica, Energia, Biocombustíveis',
  },
]

export function getMockEmpresaByCnpj(cnpj: string): EmpresaDetail | null {
  const normalized = normalizeCnpj(cnpj)
  return MOCK_EMPRESAS.find(e => normalizeCnpj(e.cnpj) === normalized) ?? null
}

export function getMockVagasByEmpresaCnpj(cnpj: string): VagaCardData[] {
  const normalized = normalizeCnpj(cnpj)
  return MOCK_VAGAS.filter(
    v => v.empresaCnpj && normalizeCnpj(v.empresaCnpj) === normalized
  )
}
