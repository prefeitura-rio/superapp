import type { ImovelResponse } from '@/http-divida-ativa/models'
import { somenteDigitos } from '@/lib/divida-ativa-utils'
import type { ImovelDividaAtiva } from '@/types/divida-ativa'

/**
 * Camada anti-corrupção entre o contrato da API `api-imoveis` e os tipos de visão do
 * produto. Os mappers são deliberadamente **tolerantes**: aceitam a forma que a API
 * devolve hoje e também as formas que ela pode passar a devolver, para que uma
 * divergência de contrato custe um ajuste aqui em vez de uma varredura pelas telas.
 *
 * O contrato real substituiu o provisório em 17/08/2026, verificado por chamada ao vivo
 * contra a instância de homologação. As divergências e as decisões que sobraram estão em
 * `docs/divida-ativa.md`.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/

/**
 * Aceita número, string decimal com ponto e string pt-BR com milhar e símbolo de moeda.
 * Devolve `null` quando o valor está ausente ou não é numérico — nunca `NaN`, que
 * atravessaria a formatação e chegaria à tela como "NaN".
 *
 * A API real devolve **todos** os valores monetários como string. Qual das duas
 * convenções ela usa segue não verificado: no dado de homologação disponível todos os
 * campos de valor vieram `null`, porque o imóvel de teste não tem CDA em aberto.
 */
export function parseValorMonetario(valor: unknown): number | null {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null
  }

  if (typeof valor !== 'string') {
    return null
  }

  const semMoeda = valor.replace(/[R$\s]/g, '')
  if (semMoeda === '') {
    return null
  }

  // "1.234,56" (pt-BR) vs "1234.56" (decimal com ponto)
  const normalizado = semMoeda.includes(',')
    ? semMoeda.replace(/\./g, '').replace(',', '.')
    : semMoeda

  const numero = Number(normalizado)

  return Number.isFinite(numero) ? numero : null
}

/**
 * Normaliza para data ISO (YYYY-MM-DD). Aceita ISO, date-time (com ou sem fuso) e o
 * formato brasileiro. Compara os componentes depois de montar a data para rejeitar
 * valores como 31/02.
 *
 * A API real usa os dois: `dd/MM/yyyy` nos campos vindos do DAM e um `LocalDateTime`
 * sem fuso (`2026-06-22T15:40:46.477`) em `dataInclusao`.
 */
export function parseDataApi(valor: unknown): string | null {
  if (typeof valor !== 'string' || valor === '') {
    return null
  }

  const br = valor.match(BR_DATE)
  if (br) {
    const [, dia, mes, ano] = br
    return validarDataIso(`${ano}-${mes}-${dia}`)
  }

  const apenasData = valor.split('T')[0]
  if (ISO_DATE.test(apenasData)) {
    return validarDataIso(apenasData)
  }

  return null
}

function validarDataIso(iso: string): string | null {
  const data = new Date(`${iso}T00:00:00Z`)

  if (Number.isNaN(data.getTime())) {
    return null
  }

  // Rejeita datas que o Date "corrige" sozinho (ex.: 2023-02-31 vira 03/03).
  return data.toISOString().slice(0, 10) === iso ? iso : null
}

function textoOuNull(valor: string | undefined): string | null {
  return valor && valor !== '' ? valor : null
}

function numeroOuNull(valor: number | undefined): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null
}

/**
 * `GET /imoveis` devolve um **array cru** — verificado ao vivo em 17/08/2026. O spec do
 * Quarkus tipa a resposta como objeto singular, então o tipo gerado pelo Orval mente, e
 * é por isso que este normalizador existe em vez de um simples `.map()`.
 *
 * Aceita as três formas possíveis (array, objeto único, envelope `{ data: [...] }`) para
 * que a correção do spec do lado da API não vire uma quebra silenciosa do nosso lado.
 */
export function normalizarListaImoveis(data: unknown): ImovelResponse[] {
  if (Array.isArray(data)) {
    return data as ImovelResponse[]
  }

  if (typeof data !== 'object' || data === null) {
    return []
  }

  const envelope = (data as { data?: unknown }).data
  if (Array.isArray(envelope)) {
    return envelope as ImovelResponse[]
  }

  return [data as ImovelResponse]
}

export function mapApiToImovel(api: ImovelResponse): ImovelDividaAtiva {
  return {
    id: numeroOuNull(api.id),
    inscricao: somenteDigitos(api.numInscricao ?? ''),
    endereco: textoOuNull(api.endereco),
    // A API não separa bairro, não devolve proprietário nem o nome dado pelo cidadão, e
    // `GET /imoveis` não consulta a Fazenda para saber de débitos. Estes são `null` por
    // ausência de dado, não por omissão nossa — premissas P22, P19, P23 e P12 em
    // `docs/divida-ativa.md`.
    nome: null,
    bairro: null,
    proprietario: null,
    possuiDebitos: null,
    cadastradoEm: parseDataApi(api.dataInclusao),
    // `api.cpf` existe na resposta e é deliberadamente descartado: identidade vem do
    // token, e CPF não atravessa a fronteira para o tipo de visão (LGPD).
  }
}

/**
 * Mensagem de erro **exibível ao cidadão**, extraída do envelope da API.
 *
 * A API devolve `{ error: string }` sem campo `code`, e a exibibilidade depende do
 * status — verificado ao vivo em 17/08/2026:
 *
 * - **400** → mensagem de negócio em português ("Este imovel ja esta cadastrado para o
 *   usuario.") — serve para a tela.
 * - **401** → `"HTTP 401 Unauthorized"`, técnico e em inglês.
 * - **404** → corpo vazio.
 * - **5xx** → vaza nome de sistema interno ("Falha ao consultar imovel no WS Fazenda
 *   IPTU.").
 *
 * Sem `code`, o status é o único discriminador disponível, então só o 400 passa. Devolve
 * `null` em todo o resto — quem chama escolhe a copy, em vez de a tela mostrar texto
 * técnico ao cidadão. Ver premissa P10 em `docs/divida-ativa.md`.
 */
export function mapApiToMensagemErro(
  data: unknown,
  status: number
): string | null {
  if (status !== 400) return null

  if (typeof data !== 'object' || data === null) return null

  const mensagem = (data as { error?: unknown }).error

  return typeof mensagem === 'string' && mensagem !== '' ? mensagem : null
}
