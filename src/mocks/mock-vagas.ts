import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import type { VagaDetail } from '@/lib/emprego-utils'

/**
 * Mock de vagas para desenvolvimento.
 * Badges: modalidade (Presencial/Remoto/Híbrido), bairro, salário (R$1.000,00), Acessível PcD | Preferencial PcD
 */
export const MOCK_VAGAS: VagaCardData[] = [
  {
    id: '1',
    titulo: 'Mestre de Obras - Alta experiência',
    empresaNome: 'Odebrecht Engenharia e Construção',
    empresaCnpj: '60746948000112',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
      { text: 'Campo Grande', type: 'bairro' },
      { text: 'R$3.200,00', type: 'salary' },
    ],
  },
  {
    id: '2',
    titulo: 'Guia de Turismo Bilíngue',
    empresaNome: 'Prefeitura Municipal do Rio de Janeiro',
    empresaCnpj: '41442565000180',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Flamengo', type: 'bairro' },
      { text: 'R$1.769,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: '14',
    titulo: 'Auxiliar Administrativo - Exclusivo PcD',
    empresaNome: 'Prefeitura Municipal do Rio de Janeiro',
    empresaCnpj: '41442565000180',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Centro', type: 'bairro' },
      { text: 'R$2.500,00', type: 'salary' },
      { text: 'Exclusivo PCD', type: 'exclusivo_pcd' },
    ],
  },
  {
    id: '3',
    titulo: 'Engenheiro de Processos Sênior',
    empresaNome: 'Petrobrás S.A.',
    empresaCnpj: '33000167000101',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Porto Maravilha', type: 'bairro' },
      { text: 'R$8.500,00', type: 'salary' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
    ],
  },
  {
    id: '11',
    titulo: 'Encarregado de Obras',
    empresaNome: 'Odebrecht Engenharia e Construção',
    empresaCnpj: '60746948000112',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Barra da Tijuca', type: 'bairro' },
      { text: 'R$2.800,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: '12',
    titulo: 'Agente de Atendimento ao Cidadão',
    empresaNome: 'Prefeitura Municipal do Rio de Janeiro',
    empresaCnpj: '41442565000180',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Centro', type: 'bairro' },
      { text: 'R$2.100,00', type: 'salary' },
    ],
  },
  {
    id: '13',
    titulo: 'Técnico de Manutenção Industrial',
    empresaNome: 'Petrobrás S.A.',
    empresaCnpj: '33000167000101',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Duque de Caxias', type: 'bairro' },
      { text: 'R$5.200,00', type: 'salary' },
      { text: 'Preferencial PcD', type: 'preferencial_pcd' },
    ],
  },
  {
    id: '4',
    titulo: 'Desenvolvedor de Software',
    empresaNome: 'Google',
    badges: [
      { text: 'Remoto', type: 'modality' },
      { text: 'R$7.000,00', type: 'salary' },
    ],
  },
  {
    id: '5',
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
    id: '6',
    titulo: 'Vendedor de Loja',
    empresaNome: 'SENAI',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Barra da Tijuca', type: 'bairro' },
      { text: 'R$1.800,00', type: 'salary' },
    ],
  },
  {
    id: '7',
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
    id: '8',
    titulo: 'Atendente de Telemarketing',
    empresaNome: 'Claro S.A.',
    badges: [
      { text: 'Remoto', type: 'modality' },
      { text: 'R$1.654,00', type: 'salary' },
      { text: 'Acessível PcD', type: 'acessivel_pcd' },
    ],
  },
  {
    id: '9',
    titulo: 'Assistente Administrativo',
    empresaNome: 'Prefeitura Municipal',
    badges: [
      { text: 'Presencial', type: 'modality' },
      { text: 'Tijuca', type: 'bairro' },
      { text: 'R$3.000,00', type: 'salary' },
    ],
  },
  {
    id: '10',
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

const ETAPAS_PROCESSO_PADRAO: VagaDetail['etapasProcessoSeletivo'] = [
  {
    ordem: 1,
    titulo: 'Envio da candidatura',
    descricao:
      'Inscrição realizada com sucesso. Os dados informados serão analisados pela equipe responsável.',
  },
  { ordem: 2, titulo: 'Análise de currículo', descricao: '' },
  { ordem: 3, titulo: 'Entrevista', descricao: '' },
]

const MOCK_DETAIL_BY_ID: Record<
  string,
  Partial<
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
      | 'etapasProcessoSeletivo'
      | 'etapaAtualCandidatura'
      | 'orgaoParceiro'
    >
  >
> = {
  1: {
    dataEncerramentoInscricoes: '26 de agosto',
    dataLimiteInscricao: '26/08/2026',
    valorVaga: 'R$ 3.200,00',
    regimeContratacao: 'CLT',
    localTrabalho: 'Campo Grande',
    descricao:
      'Atuar na coordenação e supervisão de equipes de obra, garantindo o cumprimento de prazos, normas de segurança e qualidade. Experiência comprovada em obras de médio e grande porte.',
    requisitos:
      'Experiência comprovada como Mestre de Obras ou Encarregado de Obras.\nConhecimento prático em execução de obras.',
    diferenciais:
      'Vivência em obras públicas ou de infraestrutura.\nCurso de NR-35 ou NR-33.',
    responsabilidades:
      'Supervisionar equipe de pedreiros e serventes.\nAcompanhar cronograma e relatórios de avanço.',
    beneficios: 'Vale-transporte, vale-refeição e assistência médica.',
    etapasProcessoSeletivo: ETAPAS_PROCESSO_PADRAO,
    etapaAtualCandidatura: 0,
    orgaoParceiro: 'Secretaria Municipal de Trabalho e Renda',
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
    b => b.type === 'preferencial_pcd' || b.type === 'acessivel_pcd' || b.type === 'exclusivo_pcd'
  )
  const override = MOCK_DETAIL_BY_ID[vaga.id] ?? {}

  return {
    dataEncerramentoInscricoes:
      override.dataEncerramentoInscricoes ?? '26 de agosto',
    dataLimiteInscricao: override.dataLimiteInscricao ?? '26/08/2026',
    valorVaga: override.valorVaga ?? salaryBadge?.text ?? 'A combinar',
    regimeContratacao: override.regimeContratacao ?? 'CLT',
    localTrabalho: override.localTrabalho ?? bairroBadge?.text ?? '—',
    acessibilidade:
      override.acessibilidade ??
      (pcd
        ? pcd.type === 'preferencial_pcd'
          ? 'Preferencial para PcD'
          : pcd.type === 'exclusivo_pcd'
            ? 'Exclusivo para PcD'
            : 'Acessível para PcD'
        : 'Não informado'),
    descricao:
      override.descricao ??
      `Descrição da vaga: ${vaga.titulo}. Confira os requisitos e benefícios abaixo.`,
    requisitos: override.requisitos ?? 'Requisitos conforme descrito na vaga.',
    beneficios: override.beneficios ?? 'A combinar com a empresa.',
    diferenciais: override.diferenciais,
    responsabilidades: override.responsabilidades,
  }
}

export function getMockVagaDetailById(id: number): VagaDetail | null {
  const vaga = MOCK_VAGAS.find(v => v.id === String(id))
  if (!vaga) return null
  const extra = getDefaultMockDetail(vaga)
  const modalityBadge = vaga.badges.find(b => b.type === 'modality')
  const hasClt = vaga.badges.some(b => b.text === 'CLT')
  const badges = hasClt ? vaga.badges : [{ text: 'CLT' }, ...vaga.badges]
  const detailOverride = MOCK_DETAIL_BY_ID[vaga.id] ?? {}
  return {
    id: vaga.id,
    titulo: vaga.titulo,
    dataEncerramentoInscricoes: extra.dataEncerramentoInscricoes,
    badges,
    empresaNome: vaga.empresaNome,
    empresaLogo: vaga.empresaLogo,
    empresaCnpj: vaga.empresaCnpj,
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
    etapasProcessoSeletivo: detailOverride.etapasProcessoSeletivo,
    etapaAtualCandidatura: detailOverride.etapaAtualCandidatura,
    orgaoParceiro: detailOverride.orgaoParceiro,
  }
}
