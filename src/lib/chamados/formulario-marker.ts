/**
 * Marcador "o cidadão foi ao formulário do 1746". O formulário é externo e não
 * avisa o superapp quando um chamado é aberto, então a ida é registrada aqui e,
 * na volta:
 *
 * - o cache de chamados é invalidado (`ChamadosCacheSync`);
 * - `/minhas-solicitacoes` abre direto nos chamados do novo 1746 (Salesforce).
 *
 * É um cookie (e não `sessionStorage`) para o servidor também enxergá-lo: assim
 * a página já sai renderizada na origem certa, sem piscar o histórico legado.
 * Guarda só um timestamp, vale 1 h e é apagado na volta.
 */
export const FORMULARIO_MARKER_COOKIE = 'chamados_formulario_aberto'
const MARKER_TTL_S = 60 * 60

/** `true` se o valor do cookie é um timestamp de menos de 1 h. */
export function isFormularioMarkerValid(raw: string | undefined): boolean {
  if (!raw) return false
  const marcadoEm = Number(raw)
  return (
    Number.isFinite(marcadoEm) && Date.now() - marcadoEm < MARKER_TTL_S * 1000
  )
}

function readCookie(): string | undefined {
  const prefixo = `${FORMULARIO_MARKER_COOKIE}=`
  return document.cookie
    .split('; ')
    .find(parte => parte.startsWith(prefixo))
    ?.slice(prefixo.length)
}

function writeCookie(valor: string, maxAge: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${FORMULARIO_MARKER_COOKIE}=${valor}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`
}

export function markFormularioAberto(): void {
  writeCookie(String(Date.now()), MARKER_TTL_S)
}

/** Lê e remove o marcador. `true` se havia um marcador ainda válido. */
export function consumeFormularioMarker(): boolean {
  const raw = readCookie()
  if (raw === undefined) return false
  writeCookie('', 0)
  return isFormularioMarkerValid(raw)
}
