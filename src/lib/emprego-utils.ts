import type {
  VagaBadge,
  VagaCardData,
} from '@/app/components/empregos/vaga-card'
import type {
  EmpregabilidadeStatusCandidatura,
  EmpregabilidadeVaga,
  ModelsEmprego,
} from '@/http-courses/models'

export interface EtapaProcessoSeletivo {
  ordem: number
  titulo: string
  descricao?: string
}

export interface VagaDetail {
  id: string
  titulo: string
  dataEncerramentoInscricoes: string
  badges: VagaBadge[]
  empresaNome: string
  empresaLogo?: string
  empresaCnpj?: string
  descricao: string
  valorVaga: string
  regimeContratacao: string
  modeloTrabalho: string
  localTrabalho: string
  dataLimiteInscricao: string
  acessibilidade: string
  requisitos: string
  diferenciais?: string
  responsabilidades?: string
  beneficios: string
  /** Etapas do processo seletivo; quando presente, exibido na página da vaga */
  etapasProcessoSeletivo?: EtapaProcessoSeletivo[]
  /** Índice da etapa atual do candidato (0-based), quando já inscrito */
  etapaAtualCandidatura?: number
  /** Status da candidatura (reprovada, vaga_congelada, vaga_descontinuada exibem X e mensagem na etapa atual) */
  statusCandidatura?: EmpregabilidadeStatusCandidatura
  /** Órgão parceiro da vaga; quando presente, exibe o card "Vaga oferecida em parceria com" */
  orgaoParceiro?: string
}

function formatSalary(value: number): string {
  return `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function formatDateBr(isoDate: string | undefined): string {
  if (!isoDate) return '—'
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function formatDateLong(isoDate: string | undefined): string {
  if (!isoDate) return '—'
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return isoDate
  }
}

export function mapEmpregoToVagaDetail(emprego: ModelsEmprego): VagaDetail {
  const badges: VagaBadge[] = []
  const modalidade =
    (emprego as { modalidade?: string }).modalidade ?? 'Presencial'
  badges.push({ text: modalidade, type: 'modality' })
  const bairro = (emprego as { bairro?: string }).bairro
  if (bairro) badges.push({ text: bairro, type: 'bairro' })
  const tipoContratacao = emprego.tipo_contratacao
  if (tipoContratacao) {
    badges.push({ text: String(tipoContratacao), type: undefined })
  }
  const salario = emprego.salario_min ?? emprego.salario_max
  if (salario != null) {
    badges.push({ text: formatSalary(salario), type: 'salary' })
  }
  const preferencialPcd = (emprego as { preferencial_pcd?: boolean })
    .preferencial_pcd
  const acessivelPcd = (emprego as { acessivel_pcd?: boolean }).acessivel_pcd
  if (preferencialPcd) {
    badges.push({ text: 'Preferencial PcD', type: 'preferencial_pcd' })
  } else if (acessivelPcd) {
    badges.push({ text: 'Acessível PcD', type: 'acessivel_pcd' })
  }

  const acessibilidadeLabel = preferencialPcd
    ? 'Preferencial para PcD'
    : acessivelPcd
      ? 'Acessível para PcD'
      : 'Não informado'

  const valorVaga = salario != null ? formatSalary(salario) : 'A combinar'

  return {
    id: String(emprego.id ?? 0),
    titulo: emprego.titulo ?? 'Vaga',
    dataEncerramentoInscricoes: formatDateLong(emprego.data_limite_candidatura),
    badges,
    empresaNome: emprego.empresa?.nome ?? 'Empresa',
    empresaLogo: (emprego.empresa as { logo?: string })?.logo,
    descricao: emprego.descricao ?? '',
    valorVaga,
    regimeContratacao: emprego.tipo_contratacao
      ? String(emprego.tipo_contratacao)
      : '—',
    modeloTrabalho: modalidade,
    localTrabalho: bairro ?? '—',
    dataLimiteInscricao: formatDateBr(emprego.data_limite_candidatura),
    acessibilidade: acessibilidadeLabel,
    requisitos: emprego.pre_requisitos ?? '',
    diferenciais: (emprego as { diferenciais?: string }).diferenciais,
    responsabilidades: (emprego as { responsabilidades?: string })
      .responsabilidades,
    beneficios: emprego.beneficios ?? '',
  }
}

export function mapModelsEmpregoToVagaCardData(
  emprego: ModelsEmprego
): VagaCardData {
  const badges: VagaBadge[] = []

  // Modalidade: Presencial, Remoto, Híbrido
  const modalidade =
    (emprego as { modalidade?: string }).modalidade ?? 'Presencial'
  badges.push({ text: modalidade, type: 'modality' })

  // Bairro
  const bairro = (emprego as { bairro?: string }).bairro
  if (bairro) {
    badges.push({ text: bairro, type: 'bairro' })
  }

  // Salário: valor único (prioriza salario_min)
  const salario = emprego.salario_min ?? emprego.salario_max
  if (salario != null) {
    badges.push({ text: formatSalary(salario), type: 'salary' })
  }

  // Acessível PcD | Preferencial PcD
  const acessivelPcd = (emprego as { acessivel_pcd?: boolean }).acessivel_pcd
  const preferencialPcd = (emprego as { preferencial_pcd?: boolean })
    .preferencial_pcd
  if (preferencialPcd) {
    badges.push({ text: 'Preferencial PcD', type: 'preferencial_pcd' })
  } else if (acessivelPcd) {
    badges.push({ text: 'Acessível PcD', type: 'acessivel_pcd' })
  }

  return {
    id: String(emprego.id ?? 0),
    titulo: emprego.titulo ?? 'Vaga',
    empresaNome: emprego.empresa?.nome ?? 'Empresa',
    empresaLogo: (emprego.empresa as { logo?: string })?.logo,
    badges,
  }
}

/**
 * Transforma EmpregabilidadeVaga da API em VagaDetail
 */
export function mapEmpregabilidadeVagaToDetail(
  vaga: EmpregabilidadeVaga
): VagaDetail {
  const badges: VagaBadge[] = []

  // Badge do modelo de trabalho
  if (vaga.modelo_trabalho?.descricao) {
    badges.push({
      text: vaga.modelo_trabalho.descricao,
      type: 'modality',
    })
  }

  // Badge do bairro
  if (vaga.bairro) {
    badges.push({
      text: vaga.bairro,
      type: 'bairro',
    })
  }

  // Badge do regime de contratação
  if (vaga.regime_contratacao?.descricao) {
    badges.push({
      text: vaga.regime_contratacao.descricao,
      type: undefined,
    })
  }

  // Badge do salário
  if (vaga.valor_vaga && vaga.valor_vaga > 0) {
    badges.push({
      text: formatSalary(vaga.valor_vaga),
      type: 'salary',
    })
  }

  // Badges de acessibilidade PCD
  const preferencialPcd = vaga.acessibilidade_pcd === 'preferencial_pcd'
  const exclusivoPcd = vaga.acessibilidade_pcd === 'exclusivo_pcd'
  const acessivelPcd = vaga.acessibilidade_pcd === 'para_pcd'

  if (preferencialPcd) {
    badges.push({ text: 'Preferencial PcD', type: 'preferencial_pcd' })
  } else if (exclusivoPcd) {
    badges.push({ text: 'Exclusivo PcD', type: 'exclusivo_pcd' })
  } else if (acessivelPcd) {
    badges.push({ text: 'Acessível PcD', type: 'acessivel_pcd' })
  }

  // Label de acessibilidade
  const acessibilidadeLabel = preferencialPcd
    ? 'Preferencial para PcD'
    : exclusivoPcd
      ? 'Exclusivo para PcD'
      : acessivelPcd
        ? 'Acessível para PcD'
        : 'Não informado'

  // Valor da vaga formatado
  const valorVaga =
    vaga.valor_vaga && vaga.valor_vaga > 0
      ? formatSalary(vaga.valor_vaga)
      : 'A combinar'

  // Etapas do processo seletivo
  const etapasProcessoSeletivo: EtapaProcessoSeletivo[] | undefined =
    vaga.etapas?.map((etapa, index) => ({
      ordem: index + 1,
      titulo: etapa.titulo || `Etapa ${index + 1}`,
      descricao: etapa.descricao,
    }))

  return {
    id: vaga.id || '',
    titulo: vaga.titulo || 'Vaga',
    dataEncerramentoInscricoes: formatDateLong(vaga.data_limite),
    badges,
    empresaNome:
      vaga.contratante?.nome_fantasia ||
      vaga.contratante?.razao_social ||
      'Empresa',
    empresaLogo: vaga.contratante?.url_logo,
    empresaCnpj: vaga.contratante?.cnpj,
    descricao: vaga.descricao || '',
    valorVaga,
    regimeContratacao: vaga.regime_contratacao?.descricao || '—',
    modeloTrabalho: vaga.modelo_trabalho?.descricao || '—',
    localTrabalho: vaga.bairro || '—',
    dataLimiteInscricao: formatDateBr(vaga.data_limite),
    acessibilidade: acessibilidadeLabel,
    requisitos: vaga.requisitos || '',
    diferenciais: vaga.diferenciais,
    responsabilidades: vaga.responsabilidades,
    beneficios: vaga.beneficios || '',
    etapasProcessoSeletivo,
    orgaoParceiro: vaga.orgao_parceiro?.name,
  }
}
