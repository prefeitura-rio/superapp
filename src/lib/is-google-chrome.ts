/**
 * `true` só no Google Chrome (desktop e Android).
 *
 * Usado pelo "Sair" (`useLogout`) para escolher como encerrar a sessão do
 * Gov.br: o Chrome ainda envia o cookie do Gov.br ao iframe oculto; os demais
 * navegadores (Safari, Firefox, Brave, Edge, Samsung Internet, Chrome no iOS,
 * WebViews) bloqueiam ou podem bloquear cookies de terceiros e precisam da
 * navegação de topo.
 *
 * A marca vem de `navigator.userAgentData.brands` (User-Agent Client Hints), e
 * não do User-Agent: Edge, Opera, Samsung Internet e Brave também têm `Chrome/`
 * no User-Agent (o do Brave é idêntico ao do Chrome), mas só o Google Chrome
 * tem a marca "Google Chrome". Safari, Firefox e o Chrome no iOS (WebKit) não
 * expõem `userAgentData` e dão `false`, assim como contextos não seguros (HTTP
 * fora de `localhost`), onde a API não existe.
 *
 * Errar aqui só troca qual dos dois logouts roda; não é controle de segurança.
 */
export function isGoogleChrome(): boolean {
  if (typeof navigator === 'undefined') return false

  const brands = (navigator as NavigatorWithUAData).userAgentData?.brands
  if (!Array.isArray(brands)) return false

  return brands.some(({ brand }) => brand === 'Google Chrome')
}

/** `NavigatorUAData` ainda não faz parte do `lib.dom` do TypeScript. */
interface NavigatorWithUAData extends Navigator {
  userAgentData?: {
    brands?: readonly { brand: string; version: string }[]
  }
}
