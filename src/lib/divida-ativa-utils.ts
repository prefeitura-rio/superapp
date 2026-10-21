import type { CriterioDebitos } from '@/types/divida-ativa'

/**
 * Formatadores client-safe do módulo Dívida Ativa.
 *
 * A inscrição imobiliária trafega e é armazenada **somente com dígitos** (premissa P4 do
 * contrato). A máscara existe apenas para leitura humana, e por isso mora aqui, no front —
 * nunca no que é enviado à API.
 */

/** Tamanhos válidos da inscrição imobiliária, incluindo o dígito verificador. */
export const INSCRICAO_MIN_DIGITOS = 7
export const INSCRICAO_MAX_DIGITOS = 8

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/**
 * Máscara de exibição da inscrição imobiliária: o último dígito é o verificador e o corpo é
 * agrupado de três em três, da direita para a esquerda.
 *
 * - 8 dígitos → `0.521.766-3`
 * - 7 dígitos → `521.766-3`
 *
 * Abaixo de sete dígitos o valor sai sem máscara: como a inscrição pode ter 7 **ou** 8
 * dígitos, não há como saber onde cai o verificador antes disso, e mascarar produziria
 * estados intermediários sem sentido a cada tecla.
 */
export function formatarInscricaoImobiliaria(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, INSCRICAO_MAX_DIGITOS)

  if (digitos.length < INSCRICAO_MIN_DIGITOS) return digitos

  const verificador = digitos.slice(-1)
  const corpo = digitos.slice(0, -1)

  const grupos: string[] = []
  for (let fim = corpo.length; fim > 0; fim -= 3) {
    grupos.unshift(corpo.slice(Math.max(0, fim - 3), fim))
  }

  return `${grupos.join('.')}-${verificador}`
}

/** Formato aceito pelo front. A validação de existência e vínculo é da API. */
export function isInscricaoImobiliariaValida(valor: string): boolean {
  const digitos = somenteDigitos(valor)

  return (
    digitos.length >= INSCRICAO_MIN_DIGITOS &&
    digitos.length <= INSCRICAO_MAX_DIGITOS
  )
}

/**
 * O número da execução fiscal chega em dois formatos, conforme a época do ajuizamento:
 *
 * - **CNJ** (a partir de 2010), `NNNNNNN-DD.AAAA.J.TR.OOOO` — 20 dígitos. O sequencial
 *   costuma vir **sem os zeros à esquerda** (`4236809-22.2010.8.19.0001` em vez de
 *   `0423680-92…`): o que identifica o processo é a cauda fixa de 13 dígitos, então o número
 *   real pode ter de 15 a 20 dígitos.
 * - **Antigo do TJRJ** (antes do CNJ), `AAAA.CCC.NNNNNN-D` — 14 dígitos: ano, comarca/serventia,
 *   sequencial e verificador. Ex.: `2000.120.000706-1`.
 */
export const EXECUCAO_FISCAL_ANTIGA_DIGITOS = 14
export const EXECUCAO_FISCAL_CNJ_MIN_DIGITOS = 15
export const EXECUCAO_FISCAL_CNJ_MAX_DIGITOS = 20

/** Cauda fixa do CNJ, `DD.AAAA.J.TR.OOOO`, lida da direita para a esquerda. */
const CAUDA_CNJ: Array<{ tamanho: number; separador: string }> = [
  { tamanho: 4, separador: '.' },
  { tamanho: 2, separador: '.' },
  { tamanho: 1, separador: '.' },
  { tamanho: 4, separador: '.' },
  { tamanho: 2, separador: '-' },
]

/**
 * Máscara do número da execução fiscal, escolhida pelo tamanho:
 *
 * - até 13 dígitos → sem máscara (ainda não dá para saber o formato);
 * - 14 dígitos → antigo do TJRJ, `AAAA.CCC.NNNNNN-D`;
 * - 15 a 20 dígitos → CNJ, ancorado **pela direita**: a cauda tem posições fixas e o que
 *   sobra à esquerda é o sequencial, com ou sem os zeros.
 *
 * Como a inscrição imobiliária, a máscara muda enquanto o cidadão digita — é o preço de
 * aceitar o sequencial sem zeros. E ela tolera o valor colado já pontuado: `somenteDigitos`
 * desmonta antes de remontar, então colar não duplica separador.
 */
export function formatarExecucaoFiscal(valor: string): string {
  const digitos = somenteDigitos(valor).slice(
    0,
    EXECUCAO_FISCAL_CNJ_MAX_DIGITOS
  )

  if (digitos.length < EXECUCAO_FISCAL_ANTIGA_DIGITOS) return digitos

  if (digitos.length === EXECUCAO_FISCAL_ANTIGA_DIGITOS) {
    return `${digitos.slice(0, 4)}.${digitos.slice(4, 7)}.${digitos.slice(7, 13)}-${digitos.slice(13)}`
  }

  let restante = digitos
  let formatado = ''

  for (const { tamanho, separador } of CAUDA_CNJ) {
    formatado = `${separador}${restante.slice(-tamanho)}${formatado}`
    restante = restante.slice(0, -tamanho)
  }

  return `${restante}${formatado}`
}

/**
 * Formato aceito pelo front: CNJ (15 a 20 dígitos) ou antigo do TJRJ (14). Existência do
 * processo é da API — por isso não conferimos o dígito verificador aqui.
 */
export function isExecucaoFiscalValida(valor: string): boolean {
  const digitos = somenteDigitos(valor)

  return (
    digitos.length >= EXECUCAO_FISCAL_ANTIGA_DIGITOS &&
    digitos.length <= EXECUCAO_FISCAL_CNJ_MAX_DIGITOS
  )
}

/**
 * A CDA tem série, número e ano — 12 dígitos — e pode trazer um sufixo de até dois dígitos
 * depois do hífen: `01/021580/2003-00`. O sufixo nem sempre aparece, então o front aceita
 * as três formas.
 */
export const CDA_MIN_DIGITOS = 12
export const CDA_MAX_DIGITOS = 14

/**
 * Máscara da CDA, `SS/NNNNNN/AAAA-XX`, como o número vem na carta da PGM.
 *
 * Posições fixas: a máscara entra a cada tecla e tolera o número
 * colado já pontuado. O hífen só aparece se o cidadão continuar digitando depois do ano —
 * a CDA sem sufixo termina em `/AAAA`.
 */
export function formatarCda(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, CDA_MAX_DIGITOS)

  const partes: Array<{ tamanho: number; separador: string }> = [
    { tamanho: 2, separador: '/' },
    { tamanho: 6, separador: '/' },
    { tamanho: 4, separador: '-' },
    { tamanho: 2, separador: '' },
  ]

  let restante = digitos
  let formatado = ''

  for (const { tamanho, separador } of partes) {
    if (restante === '') break

    const grupo = restante.slice(0, tamanho)
    restante = restante.slice(tamanho)
    formatado += grupo

    if (grupo.length === tamanho && restante !== '') {
      formatado += separador
    }
  }

  return formatado
}

/**
 * CDA no formato que a API entende sem ambiguidade: `SS/NNNNNN/AAAA` ou
 * `SS/NNNNNN/AAAA-XX` — é a própria máscara.
 *
 * **Exceção à regra "só dígitos".** A API guarda a CDA com o ano na frente
 * (`AAAASSNNNNNN…`) e só reordena quando o valor chega com barra; só dígitos ela lê como já
 * reordenado. Os dígitos da carta (`SSNNNNNNAAAA…`) iriam com o ano no lugar errado e a
 * consulta não acharia nada. Por isso a barra vai junto — ver `DamFiltroFormat` na API.
 */
export function cdaParaApi(valor: string): string {
  return formatarCda(valor)
}

/**
 * Formato aceito pelo front: 12 dígitos sem o sufixo, ou 14 com ele. Existência é da API.
 *
 * Treze não: é o sufixo pela metade (`01/021580/2003-0`), e o DAM não acha a CDA assim —
 * conferido em homologação em 06/10/2026, com o mesmo número achado com 12 e com 14 dígitos.
 */
export function isCdaValida(valor: string): boolean {
  const digitos = somenteDigitos(valor)

  return (
    digitos.length === CDA_MIN_DIGITOS || digitos.length === CDA_MAX_DIGITOS
  )
}

/**
 * Valor monetário em reais, no formato que o Figma mostra: `R$1.534,21` — sem espaço
 * depois do cifrão, como no resto do app (ver `src/lib/emprego-utils.ts`).
 *
 * Devolve `null` para valor ausente, e não `R$0,00`: zero é um saldo, ausência é
 * desconhecimento, e a tela precisa distinguir os dois para omitir a linha em vez de
 * afirmar que o cidadão não deve nada. Premissa P1 — valores monetários ainda não foram
 * vistos preenchidos em homologação.
 */
export function formatarValorBRL(valor: number | null): string | null {
  if (valor === null || !Number.isFinite(valor)) return null

  return `R$${valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Posições com que a API grava e devolve a inscrição imobiliária (premissa P21). */
export const INSCRICAO_DIGITOS_API = 8

/**
 * Forma canônica da inscrição para ir à API: 8 dígitos, completando com zero à esquerda.
 *
 * O carnê de IPTU traz 7 dígitos e o cadastro da API guarda 8 — é o mesmo zero que a decisão
 * D7 manda exibir. `GET /imoveis/{inscricao}/divida-ativa` leva a inscrição no **path** e,
 * ao contrário de `/imoveis/{inscricao}/consulta`, não documenta normalização nenhuma; sem
 * completar aqui, quem digita o número do carnê recebe 404 de imóvel não cadastrado mesmo
 * tendo o imóvel cadastrado.
 *
 * Valor acima de 8 dígitos passa intacto: truncar mandaria à API a inscrição de outro
 * imóvel, o que é pior que um 404 honesto.
 */
export function inscricaoParaApi(valor: string): string {
  const digitos = somenteDigitos(valor)

  return digitos.length < INSCRICAO_DIGITOS_API
    ? digitos.padStart(INSCRICAO_DIGITOS_API, '0')
    : digitos
}

/**
 * Traduz o que a tela de entrada pôs na URL no critério único da consulta.
 *
 * A ordem é a da lista de modos, e o primeiro preenchido vence: a API aceita **um** critério
 * por consulta (RN-001/RN-002), e um endereço editado à mão com dois parâmetros não pode
 * virar chamada ambígua.
 *
 * Compartilhada entre `/parcelamento/debitos` e `/parcelamento/revisao`: as duas rotas
 * recebem o mesmo critério na URL e consultam a mesma API (`getDalDividaAtivaConsultaAvulsa`).
 */
export function criterioDaUrl(params: {
  inscricao?: string
  cda?: string
  execucaoFiscal?: string
}): CriterioDebitos | null {
  if (params.inscricao) return { tipo: 'inscricao', valor: params.inscricao }
  if (params.cda) return { tipo: 'cda', valor: params.cda }
  if (params.execucaoFiscal) {
    return { tipo: 'execucao-fiscal', valor: params.execucaoFiscal }
  }

  return null
}

/**
 * Rótulo curto da natureza da dívida, para o título dos cards: `"IPTU/Taxas - Predial"` →
 * `"IPTU"`.
 *
 * O DAM só manda a descrição longa (`naturezaDivida`) — `receita` é código (`"4693"`), não
 * texto. O Figma usa o trecho antes da barra como título e a descrição inteira na linha
 * "Natureza da dívida". Sem barra, a descrição já é o rótulo.
 */
export function rotuloNatureza(natureza: string | null): string | null {
  const rotulo = natureza?.split('/')[0].trim()

  return rotulo || null
}

// ── Dados do requerente e de correspondência ─────────────────────────────────────────
//
// Como a inscrição, CPF, CNPJ, telefone e CEP trafegam **só com dígitos**; as máscaras são
// exibição. Aplicadas a cada tecla, aceitam valor parcial sem produzir lixo.

/** `000.000.000-00`, progressiva. */
export function formatarCpf(valor: string): string {
  return somenteDigitos(valor)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

/** `00.000.000/0000-00`, progressiva. */
export function formatarCnpj(valor: string): string {
  return somenteDigitos(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

/** `(00) 0000-0000` ou `(00) 00000-0000`, progressiva. */
export function formatarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11)
  if (digitos.length <= 2) return digitos.replace(/^(\d+)/, '($1')

  const ddd = digitos.slice(0, 2)
  const numero = digitos.slice(2)
  const corte = digitos.length === 11 ? 5 : 4
  const corpo =
    numero.length > corte
      ? `${numero.slice(0, corte)}-${numero.slice(corte)}`
      : numero

  return `(${ddd}) ${corpo}`
}

/** `00000-000`, progressiva. */
export function formatarCep(valor: string): string {
  return somenteDigitos(valor)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2')
}

/** Dígito verificador de CPF/CNPJ: soma ponderada módulo 11. */
function digitoVerificador(digitos: string, pesos: number[]): number {
  const soma = pesos.reduce(
    (acc, peso, i) => acc + Number(digitos[i]) * peso,
    0
  )
  const resto = soma % 11

  return resto < 2 ? 0 : 11 - resto
}

/** CPF com 11 dígitos e verificadores corretos. Sequências repetidas são recusadas. */
export function isCpfValido(valor: string): boolean {
  const d = somenteDigitos(valor)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false

  const dv1 = digitoVerificador(d, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const dv2 = digitoVerificador(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])

  return dv1 === Number(d[9]) && dv2 === Number(d[10])
}

/** CNPJ com 14 dígitos e verificadores corretos. Sequências repetidas são recusadas. */
export function isCnpjValido(valor: string): boolean {
  const d = somenteDigitos(valor)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false

  const dv1 = digitoVerificador(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const dv2 = digitoVerificador(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return dv1 === Number(d[12]) && dv2 === Number(d[13])
}

/** Telefone brasileiro com DDD: 10 dígitos (fixo) ou 11 (celular, começando por 9). */
export function isTelefoneValido(valor: string): boolean {
  const d = somenteDigitos(valor)
  if (d.length === 10) return true

  return d.length === 11 && d[2] === '9'
}

const MESES_CURTOS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
] as const

/**
 * Data curta do acompanhamento, como no Figma: `2020-03-13` → `13 MAR 2020`.
 *
 * Recebe o ISO que `parseDataApi` produz e monta o texto por partes, sem `Date`: a data
 * não tem hora nem fuso, e passar por `Date` poderia voltar um dia em UTC negativo.
 * Qualquer coisa fora de `YYYY-MM-DD` sai `null` e a linha some da tela.
 */
export function formatarDataCurta(iso: string | null): string | null {
  if (!iso) return null

  const partes = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!partes) return null

  const [, ano, mes, dia] = partes
  const nomeMes = MESES_CURTOS[Number(mes) - 1]
  if (!nomeMes) return null

  return `${dia} ${nomeMes} ${ano}`
}

/** Tamanho a que o DAM completa o número do protocolo com zeros (`000146679`). */
const PROTOCOLO_DIGITOS = 9

/**
 * Protocolo para exibição: `000146679/2026`.
 *
 * O DAM ora manda o número com zeros à esquerda, ora como inteiro (`146679`); na tela os
 * dois precisam ser o mesmo protocolo, por isso o preenchimento. Sem ano sai só o número.
 */
export function formatarProtocolo(
  protocolo: string,
  ano: string | null
): string {
  const numero = /^\d+$/.test(protocolo)
    ? protocolo.padStart(PROTOCOLO_DIGITOS, '0')
    : protocolo
  return ano ? `${numero}/${ano}` : numero
}
