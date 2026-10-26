import { TipoDocumentoDam } from '@/http-divida-ativa/models'

/**
 * Regras dos anexos do requerimento — as do contrato da API (`DocumentoDamRequest`).
 *
 * Valem nas duas pontas: a tela de anexos as usa para avisar o cidadão na hora, e a Server
 * Action `enviarRequerimento` as confere de novo, porque o que chega do cliente pode ter
 * sido montado à mão.
 */

const KB = 1024
const MB = 1024 * KB

export const LIMITE_IDENTIDADE_CPF_CNPJ = 500 * KB
export const LIMITE_GERAL = 1.5 * MB

/** Identidade, CPF e CNPJ — de quem pede e do outorgante — têm o limite menor. */
const TIPOS_LIMITE_MENOR: ReadonlySet<string> = new Set<TipoDocumentoDam>([
  'IDENTIDADE',
  'CPF',
  'IDENTIDADE_OUTORGANTE',
  'CPF_OUTORGANTE',
  'CNPJ',
])

/** Limite em bytes do arquivo original (decodificado) de um tipo de documento. */
export function limiteDoTipo(tipo: TipoDocumentoDam): number {
  return TIPOS_LIMITE_MENOR.has(tipo)
    ? LIMITE_IDENTIDADE_CPF_CNPJ
    : LIMITE_GERAL
}

export function isTipoDocumento(valor: string): valor is TipoDocumentoDam {
  return (Object.values(TipoDocumentoDam) as string[]).includes(valor)
}

/** Um arquivo por tipo: o máximo de anexos é a quantidade de tipos do contrato. */
export const MAXIMO_DOCUMENTOS = Object.keys(TipoDocumentoDam).length

/** Extensões que a API aceita — ela usa a do nome do arquivo para montar o nome no DAM. */
export const EXTENSOES_PERMITIDAS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'gif',
] as const

export function extensaoPermitida(nomeArquivo: string): boolean {
  const extensao = nomeArquivo.split('.').pop()?.toLowerCase()
  return (
    nomeArquivo.includes('.') &&
    EXTENSOES_PERMITIDAS.some(permitida => permitida === extensao)
  )
}

/** Formatos aceitos, como a tela os anuncia. */
export const FORMATOS_PERMITIDOS = 'PDF, JPG, PNG ou GIF'
