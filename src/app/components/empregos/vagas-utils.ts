import type { EmpregabilidadeVaga } from '@/http-courses/models'
import type { VagaCardData } from './vaga-card'

/**
 * Verifica se uma vaga é válida para exibição
 * Critérios:
 * 1. Status deve ser "publicado_ativo"
 * 2. data_limite não pode estar no passado (ou pode ser null)
 */
export function isVagaValida(vaga: EmpregabilidadeVaga): boolean {
  // Verifica status
  if (vaga.status !== 'publicado_ativo') {
    return false
  }

  // Verifica data_limite
  if (vaga.data_limite) {
    const dataLimite = new Date(vaga.data_limite)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Zera horas para comparar apenas datas

    if (dataLimite < hoje) {
      return false
    }
  }

  return true
}

/**
 * Transforma EmpregabilidadeVaga em VagaCardData
 */
export function transformVagaToCardData(
  vaga: EmpregabilidadeVaga
): VagaCardData {
  const badges: VagaCardData['badges'] = []

  // Adiciona badge do modelo de trabalho
  if (vaga.modelo_trabalho?.descricao) {
    badges.push({
      text: vaga.modelo_trabalho.descricao,
      type: 'modality',
    })
  }

  // Adiciona badge do bairro
  if (vaga.bairro) {
    badges.push({
      text: vaga.bairro,
      type: 'bairro',
    })
  }

  // Adiciona badge do salário
  if (vaga.valor_vaga && vaga.valor_vaga > 0) {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(vaga.valor_vaga)

    badges.push({
      text: valorFormatado,
      type: 'salary',
    })
  }

  // Adiciona badge de acessibilidade PCD
  if (vaga.acessibilidade_pcd === 'preferencial_pcd') {
    badges.push({
      text: 'Preferencial PCD',
      type: 'preferencial_pcd',
    })
  } else if (vaga.acessibilidade_pcd === 'exclusivo_pcd') {
    badges.push({
      text: 'Exclusivo PCD',
      type: 'exclusivo_pcd',
    })
  } else if (vaga.acessibilidade_pcd === 'para_pcd') {
    badges.push({
      text: 'Acessível PCD',
      type: 'acessivel_pcd',
    })
  }

  return {
    id: vaga.id || '',
    titulo: vaga.titulo || 'Título não disponível',
    empresaNome:
      vaga.contratante?.nome_fantasia ||
      vaga.contratante?.razao_social ||
      'Empresa não disponível',
    empresaLogo: vaga.contratante?.url_logo,
    empresaCnpj: vaga.contratante?.cnpj,
    badges,
  }
}

/**
 * Filtra e transforma vagas da API
 * Retorna apenas vagas válidas transformadas para o formato VagaCardData
 */
export function processVagas(vagas: EmpregabilidadeVaga[]): VagaCardData[] {
  return vagas.filter(isVagaValida).map(transformVagaToCardData)
}

/**
 * Separa vagas em recentes e todas
 * @param vagas - Array de vagas já filtradas e ordenadas
 * @returns Objeto com recentVagas (4 primeiras) e allVagas (restante)
 */
export function separateVagas(vagas: VagaCardData[]) {
  const recentVagas = vagas.slice(0, 4)
  const allVagas = vagas.slice(4)

  return {
    recentVagas,
    allVagas,
  }
}
