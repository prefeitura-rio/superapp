import { EmpregabilidadeAcessibilidadePCD } from '@/http-courses/models/empregabilidadeAcessibilidadePCD'
import { EmpregabilidadeCriterioBloqueio } from '@/http-courses/models/empregabilidadeCriterioBloqueio'
import type { EmpregabilidadeVaga } from '@/http-courses/models/empregabilidadeVaga'

export type EligibilityCriterioSlug =
  | 'idade_minima'
  | 'escolaridade'
  | 'idioma'
  | 'pcd'

/**
 * Chave do bloqueio PcD em `criterios_bloqueio` (app-go-api, DEV-407). Ainda fora do enum gerado
 * pelo Orval (`EmpregabilidadeCriterioBloqueio`), por isso é conferida como texto.
 */
const CRITERIO_BLOQUEIO_PCD = 'pcd'

/** Opção PcD da vaga que restringe a candidatura (`opcao_pcd` do app-go-api). */
const OPCAO_PCD_EXCLUSIVA = 'exclusiva'

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
    | 'idade_minima'
    | 'id_escolaridade_minima'
    | 'idiomas_requisito'
    | 'acessibilidade_pcd'
    | 'tipos_pcd'
  > & {
    /**
     * Critérios com bloqueio de candidatura ligado no Admin (`empregabilidade.Vaga.criterios_bloqueio`
     * do app-go-api); os ausentes estão desligados e nunca bloqueiam. A API sempre o devolve
     * (`[]` quando nenhum). Ausente (`undefined`/`null`) = API anterior ao campo: vale a regra
     * antiga, que confere todo critério configurado na vaga.
     */
    criterios_bloqueio?: ReadonlyArray<EmpregabilidadeCriterioBloqueio> | null
    /**
     * Opção PcD da vaga (`aberta` | `preferencial` | `exclusiva`, app-go-api DEV-407), ainda
     * fora do client Orval. Ausente = API anterior ao campo: vale `acessibilidade_pcd`.
     */
    opcao_pcd?: string | null
  }
  nascimentoData: string | undefined
  /** Formações do currículo com id_escolaridade e status. */
  formacoesCurriculo: Array<{ id_escolaridade: string; status: string }>
  /** ID da escolaridade do RMI (autodeclarado), já resolvido via resolveEscolaridadeIdByDescricao. */
  escolaridadeRmiId: string | undefined
  /** Deficiência autodeclarada no RMI (`deficiencia` do cidadão). */
  deficiencia?: string | null
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

export function resolveEscolaridadeIdByDescricao(
  descricao: string | undefined | null,
  escolaridades: Array<{ id: string; descricao: string }>
): string | undefined {
  if (!descricao) return undefined
  const normalizado = descricao.trim().toLowerCase()
  return escolaridades.find(
    e => e.descricao.trim().toLowerCase() === normalizado
  )?.id
}

/** Minúsculas, sem acentos e sem espaços nas pontas, para comparar textos livres. */
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
    .toLowerCase()
}

/**
 * Se o cidadão declarou ter deficiência. Vazio, "Nenhuma" e as respostas negativas
 * ("Não sou pessoa com deficiência") contam como não declarada.
 */
function declarouDeficiencia(deficiencia: string | null | undefined): boolean {
  if (deficiencia == null) return false
  const normalizada = normalizarTexto(deficiencia)
  if (normalizada === '' || normalizada === 'nenhuma') return false
  return normalizada !== 'nao' && !normalizada.startsWith('nao ')
}

/** "Física", "Física ou Auditiva", "Física, Auditiva ou Visual". */
function juntarComOu(itens: string[]): string {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} ou ${itens[itens.length - 1]}`
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
  formacoesCurriculo,
  escolaridadeRmiId,
  deficiencia,
  idiomasCurriculo,
  escolaridades,
  idiomas,
  niveisIdioma,
}: EligibilityParams): EligibilityCheck {
  const failedCriterios: FailedCriterio[] = []

  // Bloqueio desligado no Admin: o critério nunca é conferido.
  const criteriosBloqueio = vaga.criterios_bloqueio
  const bloqueioLigado = (criterio: EmpregabilidadeCriterioBloqueio): boolean =>
    criteriosBloqueio == null || criteriosBloqueio.includes(criterio)
  const conferirEscolaridade =
    vaga.id_escolaridade_minima != null &&
    bloqueioLigado(EmpregabilidadeCriterioBloqueio.CriterioBloqueioEscolaridade)
  const idiomasRequisito = bloqueioLigado(
    EmpregabilidadeCriterioBloqueio.CriterioBloqueioIdioma
  )
    ? (vaga.idiomas_requisito ?? [])
    : []
  // PcD: só a vaga exclusiva restringe, e só com o bloqueio ligado explicitamente no Admin.
  // Sem a lista (API anterior ao campo) não confere: antes deste critério nenhuma vaga
  // bloqueava por PcD, e as vagas migradas nascem com o bloqueio desligado.
  const vagaExclusivaPcd =
    vaga.opcao_pcd != null
      ? vaga.opcao_pcd === OPCAO_PCD_EXCLUSIVA
      : vaga.acessibilidade_pcd ===
        EmpregabilidadeAcessibilidadePCD.AcessibilidadeExclusivoPCD
  const chavesBloqueio: ReadonlyArray<string> = criteriosBloqueio ?? []
  const conferirPcd =
    vagaExclusivaPcd && chavesBloqueio.includes(CRITERIO_BLOQUEIO_PCD)

  // Nenhum critério ativo — candidato passa automaticamente
  const temCriterios =
    vaga.idade_minima != null ||
    conferirEscolaridade ||
    idiomasRequisito.length > 0 ||
    conferirPcd

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
  if (conferirEscolaridade && vaga.id_escolaridade_minima != null) {
    const escolaridadeVaga = escolaridades.find(
      e => e.id === vaga.id_escolaridade_minima
    )
    const ordemVaga = getOrdem(escolaridades, vaga.id_escolaridade_minima)
    // Requisito "incompleto": aceita a mesma escolaridade com qualquer status não-vazio,
    // ou escolaridade de ordem superior com status Completo.
    const requisiteIsIncompleto =
      escolaridadeVaga?.descricao.toLowerCase().includes('incompleto') ?? false

    const passou = formacoesCurriculo.some(f => {
      if (!f.status) return false
      const ordemFormacao = getOrdem(escolaridades, f.id_escolaridade)
      if (
        requisiteIsIncompleto &&
        f.id_escolaridade === vaga.id_escolaridade_minima
      ) {
        // mesma escolaridade incompleta com qualquer status não-vazio → passa
        return true
      }
      // caso geral: precisa de status Completo e ordem >= requisito
      return f.status === 'Completo' && ordemFormacao >= ordemVaga
    })

    // Fallback RMI se nenhuma formação passou
    const passouviaRmi =
      !passou &&
      escolaridadeRmiId != null &&
      getOrdem(escolaridades, escolaridadeRmiId) >= ordemVaga

    if (ordemVaga === -1 || (!passou && !passouviaRmi)) {
      failedCriterios.push({
        slug: 'escolaridade',
        label: `Formação mínima — ${escolaridadeVaga?.descricao ?? 'Escolaridade mínima exigida'}`,
      })
    }
  }

  // Critério de idiomas
  for (const requisito of idiomasRequisito) {
    if (requisito.id_idioma == null || requisito.id_nivel_minimo == null)
      continue

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

  // Critério PcD
  if (conferirPcd) {
    const tiposVaga = (vaga.tipos_pcd ?? [])
      .map(tipo => tipo.descricao?.trim() ?? '')
      .filter(descricao => descricao !== '')
    const declarou = declarouDeficiencia(deficiencia)
    const tipoEmComum =
      tiposVaga.length === 0 ||
      (deficiencia != null &&
        tiposVaga.some(
          tipo => normalizarTexto(tipo) === normalizarTexto(deficiencia)
        ))

    if (!declarou || !tipoEmComum) {
      failedCriterios.push({
        slug: 'pcd',
        label:
          tiposVaga.length > 0
            ? `Ser pessoa com deficiência (${juntarComOu(tiposVaga)})`
            : 'Ser pessoa com deficiência',
      })
    }
  }

  return {
    passes: failedCriterios.length === 0,
    failedCriterios,
  }
}
