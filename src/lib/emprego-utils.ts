import type { ModelsEmprego } from '@/http-courses/models'
import type { VagaBadge, VagaCardData } from '@/app/components/empregos/vaga-card'

function formatSalary(value: number): string {
  return `R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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
