import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import type { VagaDetail } from '@/lib/emprego-utils'

/**
 * Mock de vagas para desenvolvimento.
 * Badges: modalidade (Presencial/Remoto/Híbrido), bairro, salário (R$1.000,00), Acessível PcD | Preferencial PcD
 */
export const MOCK_VAGAS: VagaCardData[] = [
  {
    id: 1,
    titulo: 'Mestre de Obras - Alta experiência',
    empresaNome: 'Odebrecht Engenharia e Construção',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
      { text: 'Campo Grande', type: 'bairro' },
      { text: 'R$3.200,00', type: 'salary' },
    ],
  },
  {
    id: 2,
    titulo: 'Guia de Turismo Bilíngue',
    empresaNome: 'Prefeitura Municipal do Rio de Janeiro',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Flamengo', type: 'bairro' },
      { text: 'R$1.769,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: 3,
    titulo: 'Engenheiro de Processos Sênior',
    empresaNome: 'Petrobrás S.A.',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Porto Maravilha', type: 'bairro' },
      { text: 'R$8.500,00', type: 'salary' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
    ],
  },
  {
    id: 4,
    titulo: 'Desenvolvedor de Software',
    empresaNome: 'Google',
    badges: [
      { text: 'Remoto', type: 'modality' },
      { text: 'R$7.000,00', type: 'salary' },
    ],
  },
  {
    id: 5,
    titulo: 'Ajudante de Pedreiro',
    empresaNome: 'Prefeitura',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Centro', type: 'bairro' },
      { text: 'R$2.500,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: 6,
    titulo: 'Vendedor de Loja',
    empresaNome: 'SENAI',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Barra da Tijuca', type: 'bairro' },
      { text: 'R$1.800,00', type: 'salary' },
    ],
  },
  {
    id: 7,
    titulo: 'Analista Financeiro',
    empresaNome: 'Banco do Brasil',
    badges: [
      { text: 'Híbrido', type: 'modality' },
      { text: 'Copacabana', type: 'bairro' },
      { text: 'R$5.300,00', type: 'salary' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
    ],
  },
  {
    id: 8,
    titulo: 'Atendente de Telemarketing',
    empresaNome: 'Claro S.A.',
    badges: [
      { text: 'Remoto', type: 'modality' },
      { text: 'R$1.654,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: 9,
    titulo: 'Assistente Administrativo',
    empresaNome: 'Prefeitura Municipal',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Tijuca', type: 'bairro' },
      { text: 'R$3.000,00', type: 'salary' },
    ],
  },
  {
    id: 10,
    titulo: 'Cozinheiro',
    empresaNome: 'Restaurante Carioca',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Botafogo', type: 'bairro' },
      { text: 'R$2.800,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
]

const MOCK_DETAIL_BY_ID: Record<
  number,
  Pick<
    VagaDetail,
    | 'descricao'
    | 'requisitos'
    | 'diferenciais'
    | 'responsabilidades'
    | 'beneficios'
    | 'dataEncerramentoInscricoes'
    | 'dataLimiteInscricao'
    | 'regimeContratacao'
    | 'localTrabalho'
    | 'valorVaga'
    | 'acessibilidade'
  >
> = {
  1: {
    dataEncerramentoInscricoes: '26 de agosto',
    dataLimiteInscricao: '26/08/2026',
    valorVaga: 'R$ 3.200,00',
    regimeContratacao: 'CLT',
    localTrabalho: 'Campo Grande',
    acessibilidade: 'Preferencial para PcD',
    descricao:
      'Atuar na coordenação e supervisão de equipes de obra, garantindo o cumprimento de prazos, normas de segurança e qualidade. Experiência comprovada em obras de médio e grande porte.',
    requisitos:
      'Experiência comprovada como Mestre de Obras ou Encarregado de Obras.\nConhecimento prático em execução de obras.',
    diferenciais:
      'Vivência em obras públicas ou de infraestrutura.\nCurso de NR-35 ou NR-33.',
    responsabilidades:
      'Supervisionar equipe de pedreiros e serventes.\nAcompanhar cronograma e relatórios de avanço.',
    beneficios: 'Vale-transporte, vale-refeição e assistência médica.',
  },
}

function getDefaultMockDetail(
  vaga: VagaCardData
): Pick<
  VagaDetail,
  | 'descricao'
  | 'requisitos'
  | 'diferenciais'
  | 'responsabilidades'
  | 'beneficios'
  | 'dataEncerramentoInscricoes'
  | 'dataLimiteInscricao'
  | 'regimeContratacao'
  | 'localTrabalho'
  | 'valorVaga'
  | 'acessibilidade'
> {
  const salaryBadge = vaga.badges.find(b => b.type === 'salary')
  const modalityBadge = vaga.badges.find(b => b.type === 'modality')
  const bairroBadge = vaga.badges.find(b => b.type === 'bairro')
  const pcd = vaga.badges.find(
    b => b.type === 'preferencial_pcd' || b.type === 'acessivel_pcd'
  )
  return {
    dataEncerramentoInscricoes: '26 de agosto',
    dataLimiteInscricao: '26/08/2026',
    valorVaga: salaryBadge?.text ?? 'A combinar',
    regimeContratacao: 'CLT',
    localTrabalho: bairroBadge?.text ?? '—',
    acessibilidade: pcd ? (pcd.type === 'preferencial_pcd' ? 'Preferencial para PcD' : 'Acessível para PcD') : 'Não informado',
    descricao: `Descrição da vaga: ${vaga.titulo}. Confira os requisitos e benefícios abaixo.`,
    requisitos: 'Requisitos conforme descrito na vaga.',
    beneficios: 'A combinar com a empresa.',
    ...MOCK_DETAIL_BY_ID[vaga.id],
  }
}

export function getMockVagaDetailById(id: number): VagaDetail | null {
  const vaga = MOCK_VAGAS.find(v => v.id === id)
  if (!vaga) return null
  const extra = getDefaultMockDetail(vaga)
  const modalityBadge = vaga.badges.find(b => b.type === 'modality')
  const hasClt = vaga.badges.some(b => b.text === 'CLT')
  const badges = hasClt
    ? vaga.badges
    : [{ text: 'CLT' }, ...vaga.badges]
  return {
    id: vaga.id,
    titulo: vaga.titulo,
    dataEncerramentoInscricoes: extra.dataEncerramentoInscricoes,
    badges,
    empresaNome: vaga.empresaNome,
    empresaLogo: vaga.empresaLogo,
    descricao: extra.descricao,
    valorVaga: extra.valorVaga,
    regimeContratacao: extra.regimeContratacao,
    modeloTrabalho: modalityBadge?.text ?? 'Presencial',
    localTrabalho: extra.localTrabalho,
    dataLimiteInscricao: extra.dataLimiteInscricao,
    acessibilidade: extra.acessibilidade,
    requisitos: extra.requisitos,
    diferenciais: extra.diferenciais,
    responsabilidades: extra.responsabilidades,
    beneficios: extra.beneficios,
  }
}
