import { isFormularioMarkerValid } from '@/lib/chamados/formulario-marker'

/** Origem dos chamados: 1746 legado (RMI) ou novo 1746 (Mulesoft/Salesforce). */
export type Origem = 'sgrc' | 'salesforce'

/**
 * Quem acessa `/minhas-solicitacoes` direto vê primeiro o histórico legado,
 * a não ser que já tenha chamados no novo 1746 (ver `resolveOrigemInicial`).
 */
export const DEFAULT_ORIGEM: Origem = 'sgrc'

/** Rótulo do período de cada origem (seletor "Data de abertura" e mensagens). */
export const ORIGEM_LABEL: Record<Origem, string> = {
  sgrc: 'abertas até 26/11/2026',
  salesforce: 'abertas a partir de 27/11/2026',
}

const OUTRA_ORIGEM: Record<Origem, Origem> = {
  sgrc: 'salesforce',
  salesforce: 'sgrc',
}

/**
 * Mensagem de quando a origem selecionada não tem nenhum chamado: diz que não
 * há solicitações naquele período e sugere trocar em "Data de abertura".
 */
export function mensagemSemChamados(origem: Origem): string {
  return `Você não possui solicitações ${ORIGEM_LABEL[origem]}. Para ver as ${ORIGEM_LABEL[OUTRA_ORIGEM[origem]]}, selecione "Data de abertura" e escolha essa opção.`
}

/**
 * Param da URL que escolhe a origem. Curto e opaco de propósito (`?o=1`): a
 * escolha não precisa ser legível para o cidadão.
 */
export const ORIGEM_PARAM = 'o'

const ORIGEM_PARA_VALOR: Record<Origem, string> = {
  sgrc: '0',
  salesforce: '1',
}

/** Valor de `?o=` para uma origem (`sgrc` -> `0`, `salesforce` -> `1`). */
export function origemToParam(origem: Origem): string {
  return ORIGEM_PARA_VALOR[origem]
}

/** Link para Minhas Solicitações já numa origem. */
export function minhasSolicitacoesHref(origem: Origem): string {
  return `/minhas-solicitacoes?${ORIGEM_PARAM}=${origemToParam(origem)}`
}

/** `?o=`: valor inválido ou ausente vira `undefined` (cai nas regras abaixo). */
export function origemFromParam(
  param: string | string[] | undefined
): Origem | undefined {
  const valor = Array.isArray(param) ? param[0] : param
  if (valor === ORIGEM_PARA_VALOR.sgrc) return 'sgrc'
  if (valor === ORIGEM_PARA_VALOR.salesforce) return 'salesforce'
  return undefined
}

/**
 * Origem pedida explicitamente, por prioridade:
 * 1. `?o=` (banner da home, link compartilhado, recarga);
 * 2. cidadão que acabou de ir ao formulário do 1746 (cookie de retorno): o
 *    chamado novo está no Salesforce.
 * `undefined` quando nenhum dos dois vale (acesso direto).
 */
export function origemExplicita(
  param: string | string[] | undefined,
  cookieFormulario: string | undefined
): Origem | undefined {
  return (
    origemFromParam(param) ??
    (isFormularioMarkerValid(cookieFormulario) ? 'salesforce' : undefined)
  )
}

/** Origem padrão do acesso direto: Salesforce se há chamados nele, senão SGRC. */
export function origemPadrao(temChamadosSalesforce: boolean): Origem {
  return temChamadosSalesforce ? 'salesforce' : DEFAULT_ORIGEM
}

/**
 * Origem aberta ao entrar em Minhas Solicitações: a explícita (`?o=` ou cookie
 * de retorno) e, sem ela, o padrão conforme o cidadão ter chamados no novo 1746.
 */
export function resolveOrigemInicial(
  param: string | string[] | undefined,
  cookieFormulario: string | undefined,
  temChamadosSalesforce = false
): Origem {
  return (
    origemExplicita(param, cookieFormulario) ??
    origemPadrao(temChamadosSalesforce)
  )
}
