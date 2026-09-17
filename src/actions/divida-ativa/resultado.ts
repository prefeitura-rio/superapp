/**
 * Resultado das mutações do módulo Dívida Ativa.
 *
 * As actions **não lançam** em erro de negócio: devolvem o motivo que a API mandou para a
 * tela decidir o que mostrar. O front nunca escreve o motivo por conta própria — quando a
 * API não manda mensagem exibível, cai numa copy genérica declarada na própria action.
 */
export type ResultadoAcaoDividaAtiva<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number }
