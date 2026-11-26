/**
 * Recarrega a página depois de uma revogação: o script do GA já carregado
 * continua na memória até a página ser recarregada.
 *
 * Fica num módulo próprio para os testes poderem substituí-lo (o jsdom não
 * implementa navegação).
 */
export function reloadPage() {
  window.location.reload()
}
