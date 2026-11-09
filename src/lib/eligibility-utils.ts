import { EmpregabilidadeAcessibilidadePCD } from '@/http-courses/models/empregabilidadeAcessibilidadePCD'
import { EmpregabilidadeCriterioBloqueio } from '@/http-courses/models/empregabilidadeCriterioBloqueio'
import type { EmpregabilidadeVaga } from '@/http-courses/models/empregabilidadeVaga'

export type EligibilityCriterioSlug =
  | 'idade_minima'
  | 'jovem_aprendiz'
  | 'escolaridade'
  | 'idioma'
  | 'pcd'
  | 'experiencia_carteira'

/**
 * Chave do bloqueio PcD em `criterios_bloqueio` (app-go-api, DEV-407). Ainda fora do enum gerado
 * pelo Orval (`EmpregabilidadeCriterioBloqueio`), por isso é conferida como texto.
 */
const CRITERIO_BLOQUEIO_PCD = 'pcd'

/**
 * Chave do bloqueio de experiência em carteira em `criterios_bloqueio` e slug do critério em
 * `/candidatura-bloqueios` (app-go-api, DEV-424). Ainda fora do enum gerado pelo Orval.
 */
const CRITERIO_BLOQUEIO_EXPERIENCIA_CARTEIRA = 'experiencia_carteira'

/**
 * Chave do bloqueio Jovem Aprendiz em `criterios_bloqueio` e slug do critério em
 * `/candidatura-bloqueios` (app-go-api, DEV-428). Ainda fora do enum gerado pelo Orval.
 */
const CRITERIO_BLOQUEIO_JOVEM_APRENDIZ = 'jovem_aprendiz'

/** Faixa fixa de idade do Jovem Aprendiz (inclusive nas duas pontas), sem número livre. */
const IDADE_MINIMA_JOVEM_APRENDIZ = 14
const IDADE_MAXIMA_JOVEM_APRENDIZ = 24

/** Opção PcD da vaga que restringe a candidatura (`opcao_pcd` do app-go-api). */
const OPCAO_PCD_EXCLUSIVA = 'exclusiva'

/** Tempo de experiência em carteira exigido pela vaga (`experiencia_carteira` do app-go-api). */
const EXPERIENCIA_CARTEIRA_QUALQUER_TEMPO = 'qualquer_tempo'
const EXPERIENCIA_CARTEIRA_MINIMO_6_MESES = 'minimo_6_meses'

/** Prazo fixo da opção "mínimo de 6 meses", somado entre as experiências em carteira. */
const MESES_MINIMOS_EXPERIENCIA_CARTEIRA = 6

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

export interface ExperienciaCurriculo {
  experiencia_comprovada_ct?: boolean | null
  tempo_experiencia_meses?: number | null
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
    /**
     * Tempo de experiência em carteira exigido (`qualquer_tempo` | `minimo_6_meses`, app-go-api
     * DEV-424), ainda fora do client Orval. `null`/ausente = sem exigência. Só bloqueia com a chave
     * `experiencia_carteira` em `criterios_bloqueio`.
     */
    experiencia_carteira?: string | null
    /**
     * Vaga marcada como Jovem Aprendiz na seção Idade do Admin (faixa fixa de 14 a 24 anos,
     * app-go-api DEV-428), ainda fora do client Orval. Só bloqueia com a chave `jovem_aprendiz`
     * em `criterios_bloqueio`.
     */
    jovem_aprendiz?: boolean | null
  }
  nascimentoData: string | undefined
  /** Formações do currículo com id_escolaridade e status. */
  formacoesCurriculo: Array<{ id_escolaridade: string; status: string }>
  /** ID da escolaridade do RMI (autodeclarado), já resolvido via resolveEscolaridadeIdByDescricao. */
  escolaridadeRmiId: string | undefined
  /** Deficiência autodeclarada no RMI (`deficiencia` do cidadão). */
  deficiencia?: string | null
  /**
   * Catálogo de tipos PcD (`GET /api/v1/empregabilidade/tipos-pcd`). Vaga com todos eles é a
   * opção "Todos os tipos" do Admin, que grava cada id: não restringe o tipo de deficiência.
   * Ausente ou vazio (falha ao buscar): a vaga restringe aos tipos que tem.
   */
  tiposPcdCatalogo?: ReadonlyArray<{ id: string }>
  idiomasCurriculo: Array<{ id_idioma: string; id_nivel: string }>
  /**
   * Experiências do currículo (`experiencias` do currículo do app-go-api). Só contam as
   * comprovadas em carteira (`experiencia_comprovada_ct`). Ausente = nenhuma.
   */
  experienciasCurriculo?: ReadonlyArray<ExperienciaCurriculo>
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

function vagaComTodosOsTiposPcd(
  tiposVaga: EmpregabilidadeVaga['tipos_pcd'],
  catalogo: ReadonlyArray<{ id: string }> | undefined
): boolean {
  if (catalogo == null || catalogo.length === 0) return false
  const idsVaga = new Set((tiposVaga ?? []).map(tipo => tipo.id))
  return catalogo.every(tipo => idsVaga.has(tipo.id))
}

/**
 * Mesma régua do app-go-api (`ExperienciaCarteira.Atende`, DEV-424): só contam as experiências
 * comprovadas em carteira; qualquer tempo pede ao menos uma e o mínimo de 6 meses soma
 * `tempo_experiencia_meses` entre elas (sem tempo, ou negativo, conta zero).
 */
function atendeExperienciaCarteira(
  exigencia: string,
  experiencias: ReadonlyArray<ExperienciaCurriculo>
): boolean {
  const emCarteira = experiencias.filter(
    exp => exp.experiencia_comprovada_ct === true
  )
  if (exigencia === EXPERIENCIA_CARTEIRA_QUALQUER_TEMPO) {
    return emCarteira.length > 0
  }
  const totalMeses = emCarteira.reduce((total, exp) => {
    const meses = exp.tempo_experiencia_meses
    return typeof meses === 'number' && Number.isFinite(meses) && meses > 0
      ? total + meses
      : total
  }, 0)
  return totalMeses >= MESES_MINIMOS_EXPERIENCIA_CARTEIRA
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
  tiposPcdCatalogo,
  idiomasCurriculo,
  experienciasCurriculo = [],
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
  // Experiência em carteira: como o PcD, só com o bloqueio ligado explicitamente e uma opção
  // conhecida; opção desconhecida não bloqueia (a API a recusa com 400).
  const exigenciaCarteira = vaga.experiencia_carteira
  const conferirExperienciaCarteira =
    chavesBloqueio.includes(CRITERIO_BLOQUEIO_EXPERIENCIA_CARTEIRA) &&
    (exigenciaCarteira === EXPERIENCIA_CARTEIRA_QUALQUER_TEMPO ||
      exigenciaCarteira === EXPERIENCIA_CARTEIRA_MINIMO_6_MESES)
  // Jovem Aprendiz: como o PcD, só com o bloqueio ligado explicitamente e a vaga marcada; nasce
  // desligado em toda vaga existente e sem a lista (API anterior ao campo) não confere.
  const conferirJovemAprendiz =
    vaga.jovem_aprendiz === true &&
    chavesBloqueio.includes(CRITERIO_BLOQUEIO_JOVEM_APRENDIZ)

  // Nenhum critério ativo — candidato passa automaticamente
  const temCriterios =
    vaga.idade_minima != null ||
    conferirJovemAprendiz ||
    conferirEscolaridade ||
    idiomasRequisito.length > 0 ||
    conferirPcd ||
    conferirExperienciaCarteira

  if (!temCriterios) {
    return { passes: true, failedCriterios: [] }
  }

  // Critério PcD: primeiro da lista, na ordem do Admin.
  if (conferirPcd) {
    const tiposVaga = vagaComTodosOsTiposPcd(vaga.tipos_pcd, tiposPcdCatalogo)
      ? []
      : (vaga.tipos_pcd ?? [])
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

  // Critério Jovem Aprendiz: na seção Idade, logo depois da idade mínima (ordem do Admin).
  // Sem data de nascimento (ou com data inválida) não passa.
  if (conferirJovemAprendiz) {
    const idade =
      nascimentoData != null ? calcularIdade(nascimentoData) : Number.NaN
    const passou =
      idade >= IDADE_MINIMA_JOVEM_APRENDIZ &&
      idade <= IDADE_MAXIMA_JOVEM_APRENDIZ
    if (!passou) {
      failedCriterios.push({
        slug: 'jovem_aprendiz',
        label: `Ter entre ${IDADE_MINIMA_JOVEM_APRENDIZ} e ${IDADE_MAXIMA_JOVEM_APRENDIZ} anos (Jovem Aprendiz)`,
      })
    }
  }

  // Critério de experiência em carteira: depois da idade, na ordem do Admin.
  if (
    conferirExperienciaCarteira &&
    exigenciaCarteira != null &&
    !atendeExperienciaCarteira(exigenciaCarteira, experienciasCurriculo)
  ) {
    failedCriterios.push({
      slug: 'experiencia_carteira',
      label:
        exigenciaCarteira === EXPERIENCIA_CARTEIRA_MINIMO_6_MESES
          ? `Ter pelo menos ${MESES_MINIMOS_EXPERIENCIA_CARTEIRA} meses de experiência em carteira`
          : 'Ter experiência em carteira assinada',
    })
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

  return {
    passes: failedCriterios.length === 0,
    failedCriterios,
  }
}
