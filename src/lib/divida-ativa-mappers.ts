import type { FazendaImovel, ImovelResponse } from '@/http-divida-ativa/models'
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
 * A API real usa os dois: `dd/MM/yyyy` nos campos vindos do DAM e um date-time sem fuso
 * (`2026-06-22T15:40:46.477`) em `dataInclusao`. O spec chegou a declarar um schema
 * `LocalDateTime` para esse campo; em 31/08/2026 ele virou `string`/`date-time` direto,
 * sem mudança no valor que trafega.
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

/**
 * Desembrulha a resposta de `GET /imoveis/{inscricao}/cadastro`, a consulta prévia à
 * Fazenda.
 *
 * O contrato se contradiz sobre a forma: o schema declara `FazendaImovel`, um objeto, mas
 * a descrição do endpoint diz "Retorna **lista vazia** quando nao houver registro para a
 * inscricao". É a mesma armadilha da premissa P11 — `GET /imoveis` também é tipado como
 * objeto e devolve array cru —, e lá ela custou uma lista vazia em silêncio. Aceitar as
 * duas formas é mais barato que apostar em uma.
 *
 * Sem `numInscricao` não há imóvel: um `{}` ou um array vazio significam "a Fazenda não
 * conhece essa inscrição", que é um estado de tela, não um erro.
 */
export function normalizarConsultaFazenda(data: unknown): FazendaImovel | null {
  const candidato = Array.isArray(data) ? data[0] : data

  if (typeof candidato !== 'object' || candidato === null) {
    return null
  }

  const { numInscricao } = candidato as FazendaImovel

  if (typeof numInscricao !== 'string' || numInscricao === '') {
    return null
  }

  return candidato as FazendaImovel
}

/**
 * Traduz o resultado da consulta prévia à Fazenda para o tipo de visão.
 *
 * A diferença para `mapApiToImovel` não é de campos, é de **estado**: aqui o imóvel ainda
 * não foi gravado no cadastro local. `id` e `cadastradoEm` são `null` porque não existem
 * ainda — não por ausência no contrato. É `id: null` que impede a tela de oferecer
 * exclusão de algo que o banco local não tem.
 *
 * `bairro`, `proprietario` e `possuiDebitos` seguem `null` pelas mesmas premissas do outro
 * mapper (P22, P19, P12): `FazendaImovel` traz só endereço e inscrição.
 */
export function mapFazendaToImovel(api: FazendaImovel): ImovelDividaAtiva {
  return {
    id: null,
    inscricao: somenteDigitos(api.numInscricao ?? ''),
    endereco: textoOuNull(api.endereco),
    bairro: null,
    proprietario: null,
    possuiDebitos: null,
    cadastradoEm: null,
  }
}

export function mapApiToImovel(api: ImovelResponse): ImovelDividaAtiva {
  return {
    id: numeroOuNull(api.id),
    inscricao: somenteDigitos(api.numInscricao ?? ''),
    endereco: textoOuNull(api.endereco),
    // A API não separa bairro nem devolve proprietário, e `GET /imoveis` não consulta a
    // Fazenda para saber de débitos. Estes três são `null` por ausência de dado, não por
    // omissão nossa — premissas P22, P19 e P12 em `docs/divida-ativa.md`.
    bairro: null,
    proprietario: null,
    possuiDebitos: null,
    cadastradoEm: parseDataApi(api.dataInclusao),
    // `api.cpf` existe na resposta e é deliberadamente descartado: identidade vem do
    // token, e CPF não atravessa a fronteira para o tipo de visão (LGPD).
  }
}

/**
 * Copy própria para as mensagens de negócio que conhecemos.
 *
 * A API devolve texto em tom de sistema e **sem acento** ("Este imovel ja esta cadastrado
 * para o usuario."). Exibir isso cru numa tela oficial parece defeito, então os casos
 * conhecidos ganham a copy do produto e o resto cai no texto da API — que ainda é melhor
 * que uma mensagem genérica.
 *
 * A comparação é feita sobre a forma normalizada (sem acento, minúscula, pontuação
 * colapsada), o que torna o casamento imune a duas mudanças prováveis do lado da API:
 * acentuar as mensagens e mexer na pontuação.
 *
 * ⚠️ Casar por texto é frágil por natureza — uma reescrita da frase do lado dele passa
 * despercebida. A solução de verdade é um campo `code` no envelope, pedido em aberto com o
 * Vladimir; quando existir, troque a chave desta tabela pelo código.
 */
const COPY_POR_MENSAGEM_API: ReadonlyArray<{
  readonly quando: string
  readonly exibir: string
}> = [
  {
    quando: 'este imovel ja esta cadastrado para o usuario',
    exibir: 'Este imóvel já está na sua lista.',
  },
]

function normalizarMensagem(valor: string): string {
  return (
    valor
      .normalize('NFD')
      // `\p{Mn}` (Mark, nonspacing) é o conjunto dos acentos que o NFD separa da letra.
      // Escrever isso como classe de caracteres dispara `noMisleadingCharacterClass`.
      .replace(/\p{Mn}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  )
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
 *
 * Passando no filtro do 400, a mensagem conhecida é trocada pela copy do produto
 * (`COPY_POR_MENSAGEM_API`); a desconhecida sai como a API mandou.
 */
export function mapApiToMensagemErro(
  data: unknown,
  status: number
): string | null {
  if (status !== 400) return null

  if (typeof data !== 'object' || data === null) return null

  const mensagem = (data as { error?: unknown }).error

  if (typeof mensagem !== 'string' || mensagem === '') return null

  const normalizada = normalizarMensagem(mensagem)
  const conhecida = COPY_POR_MENSAGEM_API.find(
    item => item.quando === normalizada
  )

  return conhecida ? conhecida.exibir : mensagem
}
