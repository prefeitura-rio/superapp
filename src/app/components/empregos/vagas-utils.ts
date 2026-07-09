import type { EmpregabilidadeVaga } from '@/http-courses/models'
import type { VagaCardData } from './vaga-card'

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase())
}

function formatarDataPublicacao(dateStr: string): string {
  const date = new Date(dateStr)
  const dia = date.getUTCDate()
  const mes = date
    .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
    .replace('.', '')
    .toUpperCase()
  return `${dia} ${mes}`
}

/**
 * Verifica se uma vaga está dentro do prazo para exibição.
 * Nota: filtragem por status é feita pela API — esta função não repete essa verificação.
 */
export function isVagaValida(vaga: EmpregabilidadeVaga): boolean {
  if (vaga.data_limite) {
    const dataLimite = new Date(vaga.data_limite)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
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

  // Regime de contratação — obrigatório
  const REGIME_LABEL: Record<string, string> = {
    CLT: 'Efetivo (CLT)',
  }
  if (vaga.regime_contratacao?.descricao) {
    const descricao = vaga.regime_contratacao.descricao
    badges.push({
      text: REGIME_LABEL[descricao] ?? descricao,
      type: 'regime',
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

  // Badges de acessibilidade PCD
  if (vaga.acessibilidade_pcd === 'preferencial_pcd') {
    badges.push({ text: 'Preferencial PcD', type: 'preferencial_pcd' })
  } else if (vaga.acessibilidade_pcd === 'exclusivo_pcd') {
    badges.push({ text: 'Exclusiva PcD', type: 'exclusivo_pcd' })
  } else if (vaga.acessibilidade_pcd === 'para_pcd') {
    badges.push({ text: 'Para PcD', type: 'para_pcd' })
  }

  if (
    vaga.quantidade_estimada_contratacoes &&
    vaga.quantidade_estimada_contratacoes > 0
  ) {
    const qtd = vaga.quantidade_estimada_contratacoes
    badges.push({
      text: qtd === 1 ? '1 vaga' : `${qtd} vagas`,
      type: 'contratacoes',
    })
  }

  return {
    id: vaga.id || '',
    titulo: vaga.titulo || 'Título não disponível',
    empresaNome: toTitleCase(
      vaga.contratante?.nome_fantasia ||
        vaga.contratante?.razao_social ||
        'Empresa não disponível'
    ),
    empresaLogo: vaga.contratante?.url_logo,
    empresaCnpj: vaga.contratante?.cnpj,
    badges,
    dataPublicacao:
      (vaga.created_at ?? vaga.updated_at)
        ? formatarDataPublicacao((vaga.created_at ?? vaga.updated_at)!)
        : undefined,
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
