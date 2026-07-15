import type { EmpregabilidadeVaga } from '@/http-courses/models/empregabilidadeVaga'

export type EligibilityCriterioSlug = 'idade_minima' | 'escolaridade' | 'idioma'

export interface FailedCriterio {
  /** Slug enviado à API de bloqueios. */
  slug: EligibilityCriterioSlug
  /** Texto legível exibido ao candidato. */
  label: string
}

export interface EligibilityCheck {
  passes: boolean
  /** Critérios que o candidato não atendeu, com slug e label. */
  failedCriterios: FailedCriterio[]
}

interface ReferenceItem {
  id: string
  descricao: string
  ordem?: number
}

interface EligibilityParams {
  vaga: Pick<
    EmpregabilidadeVaga,
    'idade_minima' | 'id_escolaridade_minima' | 'idiomas_requisito'
  >
  nascimentoData: string | undefined
  melhorEscolaridadeId: string | undefined
  idiomasCurriculo: Array<{ id_idioma: string; id_nivel: string }>
  escolaridades: ReferenceItem[]
  idiomas: ReferenceItem[]
  niveisIdioma: ReferenceItem[]
}

function calcularIdade(nascimentoData: string): number {
  const nascimento = new Date(nascimentoData)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesAtual = hoje.getMonth()
  const mesNascimento = nascimento.getMonth()
  if (
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
  ) {
    idade--
  }
  return idade
}

function getOrdem(items: ReferenceItem[], id: string): number {
  const idx = items.findIndex(item => item.id === id)
  if (idx === -1) return -1
  // Prefer explicit ordem field; fall back to position in list (0-based)
  return items[idx].ordem ?? idx
}

export function checkEligibility({
  vaga,
  nascimentoData,
  melhorEscolaridadeId,
  idiomasCurriculo,
  escolaridades,
  idiomas,
  niveisIdioma,
}: EligibilityParams): EligibilityCheck {
  const failedCriterios: FailedCriterio[] = []

  // Nenhum critério ativo — candidato passa automaticamente
  const temCriterios =
    vaga.idade_minima != null ||
    vaga.id_escolaridade_minima != null ||
    (vaga.idiomas_requisito?.length ?? 0) > 0

  if (!temCriterios) {
    return { passes: true, failedCriterios: [] }
  }

  // Critério de idade
  if (vaga.idade_minima != null) {
    const passou =
      nascimentoData != null &&
      calcularIdade(nascimentoData) >= vaga.idade_minima
    if (!passou) {
      failedCriterios.push({
        slug: 'idade_minima',
        label: `Ter pelo menos ${vaga.idade_minima} anos`,
      })
    }
  }

  // Critério de escolaridade
  if (vaga.id_escolaridade_minima != null) {
    const ordemVaga = getOrdem(escolaridades, vaga.id_escolaridade_minima)
    const ordemCandidato =
      melhorEscolaridadeId != null
        ? getOrdem(escolaridades, melhorEscolaridadeId)
        : -1

    if (ordemVaga === -1 || ordemCandidato < ordemVaga) {
      const escolaridadeVaga = escolaridades.find(
        e => e.id === vaga.id_escolaridade_minima
      )
      failedCriterios.push({
        slug: 'escolaridade',
        label: `Formação mínima — ${escolaridadeVaga?.descricao ?? 'Escolaridade mínima exigida'}`,
      })
    }
  }

  // Critério de idiomas
  for (const requisito of vaga.idiomas_requisito ?? []) {
    const idiomasCandidato = idiomasCurriculo.filter(
      i => i.id_idioma === requisito.id_idioma
    )
    const ordemNivelMinimo = getOrdem(niveisIdioma, requisito.id_nivel_minimo)

    const passou = idiomasCandidato.some(i => {
      const ordemNivelCandidato = getOrdem(niveisIdioma, i.id_nivel)
      return ordemNivelCandidato >= ordemNivelMinimo
    })

    if (!passou) {
      const nomeIdioma =
        idiomas.find(i => i.id === requisito.id_idioma)?.descricao ??
        'Idioma exigido'
      const nomeNivelMinimo =
        niveisIdioma.find(n => n.id === requisito.id_nivel_minimo)?.descricao ??
        'nível mínimo exigido'
      failedCriterios.push({
        slug: 'idioma',
        label: `Idioma ${nomeIdioma} — nível ${nomeNivelMinimo} ou superior`,
      })
    }
  }

  return {
    passes: failedCriterios.length === 0,
    failedCriterios,
  }
}
