import type { ClientsCartaChannel } from '@/http-app-catalogo/models/clientsCartaChannel'
import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'

/**
 * Regras de conteúdo do PDF, separadas do layout para serem testáveis sem renderizar.
 */

/**
 * `href` fica clicável no PDF; `showUrl` diz se a URL também é impressa (on-line sim;
 * endereço com link do Maps e e-mail/telefone não — o texto já basta no papel).
 */
export type ChannelEntry = { text: string; href?: string; showUrl?: boolean }

const MAX_URL_CHARS = 64

/**
 * URL legível para o papel: sem protocolo/`www.`, com o percent-encoding decodificado
 * (`Informa%C3%A7%C3%B5es` → `Informações`) e cortada com "…" quando passa de
 * {@link MAX_URL_CHARS} caracteres (query strings de SSO chegam a 300+, sem espaço
 * para quebrar a linha). O corte vem depois da decodificação e conta por caractere,
 * para não partir um escape nem um emoji. O link clicável continua com a URL completa.
 */
export function displayUrl(href: string): string {
  const bare = safeDecodeUri(
    href
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/^mailto:|^tel:/i, '')
      .replace(/\/$/, '')
  )
  const chars = Array.from(bare)
  return chars.length > MAX_URL_CHARS
    ? `${chars.slice(0, MAX_URL_CHARS - 1).join('')}…`
    : bare
}

function safeDecodeUri(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
export type ChannelGroup = {
  key: 'online' | 'whatsapp' | 'telefone' | 'presencial'
  label: string
  entries: ChannelEntry[]
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

/** ISO → "31 de janeiro de 2025" (fuso de Brasília). Inválido → null. */
export function formatCartaDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return null
  return dateFormatter.format(new Date(ms))
}

export function formatServiceDates(
  service: Pick<
    ClientsCartaServiceDetail,
    'lastPublishedDate' | 'createdDate' | 'lastModifiedDate'
  >
): string | null {
  const published = formatCartaDate(
    service.lastPublishedDate ?? service.createdDate
  )
  const modified = formatCartaDate(service.lastModifiedDate)
  const parts = [
    published && `Publicado em ${published}`,
    modified && `Modificado em ${modified}`,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' – ') : null
}

const norm = (value?: string | null) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

function channelKind(channel: ClientsCartaChannel): ChannelGroup['key'] {
  const type = norm(channel.type)
  const subtype = norm(channel.channelType)
  if (channel.whatsappLink || subtype.includes('whatsapp')) return 'whatsapp'
  if (type === 'presencial') return 'presencial'
  if (type === 'telefone' || subtype.includes('telefone')) return 'telefone'
  return 'online'
}

function hrefFor(channel: ClientsCartaChannel, kind: ChannelGroup['key']) {
  if (channel.whatsappLink) return channel.whatsappLink
  const value = channel.value?.trim()
  if (!value) return channel.mapUrl || undefined
  if (/^https?:\/\//i.test(value)) return value
  if (norm(channel.channelType).includes('mail') && value.includes('@')) {
    return `mailto:${value}`
  }
  if (kind === 'telefone') return `tel:${value.replace(/[^\d+]/g, '')}`
  return undefined
}

function channelText(channel: ClientsCartaChannel, kind: ChannelGroup['key']) {
  if (kind === 'presencial') {
    return [channel.titulo, channel.endereco].filter(Boolean).join(' – ')
  }
  const raw = channel.value?.trim() || channel.whatsappLink || ''
  const value = /^https?:\/\//i.test(raw) ? displayUrl(raw) : raw
  const prefix =
    kind === 'online' && channel.channelType ? `${channel.channelType}: ` : ''
  const title = channel.titulo ? `${channel.titulo} – ` : ''
  return `${title}${prefix}${value}`.trim()
}

const GROUP_LABELS: Record<ChannelGroup['key'], string> = {
  online: 'Para solicitações on-line',
  whatsapp: 'Para solicitações via WhatsApp',
  telefone: 'Para solicitações via telefone',
  presencial: 'Para solicitações presenciais',
}

/**
 * Canais estruturados (botões + `channels`) em grupos na ordem do Figma: on-line,
 * WhatsApp, telefone, presencial. Desabilitados e vazios ficam de fora.
 */
export function groupServiceChannels(
  service: Pick<ClientsCartaServiceDetail, 'buttons' | 'channels'>
): ChannelGroup[] {
  const groups = new Map<ChannelGroup['key'], ChannelEntry[]>(
    (Object.keys(GROUP_LABELS) as ChannelGroup['key'][]).map(key => [key, []])
  )

  const buttons = [...(service.buttons ?? [])]
    .filter(button => button.enabled !== false && button.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const button of buttons) {
    groups.get('online')?.push({
      text: button.title || button.description || 'Acessar serviço',
      href: button.url,
      showUrl: true,
    })
  }

  const channels = [...(service.channels ?? [])]
    .filter(channel => channel.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const channel of channels) {
    const kind = channelKind(channel)
    const text = channelText(channel, kind)
    if (!text) continue
    // O texto do canal já traz o valor (endereço, e-mail, URL curta).
    groups
      .get(kind)
      ?.push({ text, href: hrefFor(channel, kind), showUrl: false })
  }

  return [...groups.entries()]
    .filter(([, entries]) => entries.length > 0)
    .map(([key, entries]) => ({ key, label: GROUP_LABELS[key], entries }))
}

export function serviceAnchorId(index: number): string {
  return `servico-${index + 1}`
}

/** Prazo/custo com a observação, quando houver. */
export function withNotes(
  value: string | null | undefined,
  notes: string | null | undefined
): string | null {
  const main = value?.trim()
  const extra = notes?.trim()
  if (main && extra) return `${main} (${extra})`
  return main || extra || null
}

export type TextSegment = { text: string; href?: string }

/**
 * A legislação vem como texto puro, mas às vezes com link em markdown
 * (`[Lei nº 691/1984](https://...)`). Separa em trechos de texto e link; URL que não
 * for http(s) fica como texto.
 */
export function splitMarkdownLinks(value: string): TextSegment[] {
  const segments: TextSegment[] = []
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  for (const match of value.matchAll(pattern)) {
    const [whole, text, href] = match
    const start = match.index ?? 0
    if (start > last) segments.push({ text: value.slice(last, start) })
    segments.push(/^https?:\/\//i.test(href) ? { text, href } : { text: whole })
    last = start + whole.length
  }
  if (last < value.length) segments.push({ text: value.slice(last) })
  return segments
}
