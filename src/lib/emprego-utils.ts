import type { ModelsEmprego } from '@/http-courses/models'
import type { VagaBadge, VagaCardData } from '@/app/components/empregos/vaga-card'

export interface VagaDetail {
  id: number
  titulo: string
  dataEncerramentoInscricoes: string
  badges: VagaBadge[]
  empresaNome: string
  empresaLogo?: string
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
  const modalidade = (emprego as { modalidade?: string }).modalidade ?? 'Presencial'
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
  const preferencialPcd = (emprego as { preferencial_pcd?: boolean }).preferencial_pcd
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

  const valorVaga =
    salario != null ? formatSalary(salario) : 'A combinar'

  return {
    id: emprego.id ?? 0,
    titulo: emprego.titulo ?? 'Vaga',
    dataEncerramentoInscricoes: formatDateLong(emprego.data_limite_candidatura),
    badges,
    empresaNome: emprego.empresa?.nome ?? 'Empresa',
    empresaLogo: (emprego.empresa as { logo?: string })?.logo,
    descricao: emprego.descricao ?? '',
    valorVaga,
    regimeContratacao: emprego.tipo_contratacao ? String(emprego.tipo_contratacao) : '—',
    modeloTrabalho: modalidade,
    localTrabalho: bairro ?? '—',
    dataLimiteInscricao: formatDateBr(emprego.data_limite_candidatura),
    acessibilidade: acessibilidadeLabel,
    requisitos: emprego.pre_requisitos ?? '',
    diferenciais: (emprego as { diferenciais?: string }).diferenciais,
    responsabilidades: (emprego as { responsabilidades?: string }).responsabilidades,
    beneficios: emprego.beneficios ?? '',
  }
}

export function mapModelsEmpregoToVagaCardData(emprego: ModelsEmprego): VagaCardData {
  const badges: VagaBadge[] = []

  // Modalidade: Presencial, Remoto, Híbrido
  const modalidade = (emprego as { modalidade?: string }).modalidade ?? 'Presencial'
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
  const preferencialPcd = (emprego as { preferencial_pcd?: boolean }).preferencial_pcd
  if (preferencialPcd) {
    badges.push({ text: 'Preferencial PcD', type: 'preferencial_pcd' })
  } else if (acessivelPcd) {
    badges.push({ text: 'Acessível PcD', type: 'acessivel_pcd' })
  }

  return {
    id: emprego.id ?? 0,
    titulo: emprego.titulo ?? 'Vaga',
    empresaNome: emprego.empresa?.nome ?? 'Empresa',
    empresaLogo: (emprego.empresa as { logo?: string })?.logo,
    badges,
  }
}
