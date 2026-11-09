import {
  getApiPublicOrgUnits,
  getApiPublicOrgUnitsSiciCodeServices,
} from '@/http-app-catalogo/carta/carta'
import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import type { ModelsCartaMeta } from '@/http-app-catalogo/models/modelsCartaMeta'
import type { ModelsCartaOrgUnit } from '@/http-app-catalogo/models/modelsCartaOrgUnit'
import { parseCartaServicosPayload } from '@/lib/carta-servicos/fetch'

/** Máximo aceito pela app-catalogo em `per_page`. */
export const CARTA_PER_PAGE = 100
/** Máximo aceito pela app-catalogo em `page`. */
const CARTA_MAX_PAGES = 1000

const CACHE_10MIN = { next: { revalidate: 600 } } as const

type Paged<T> = { data?: T[]; meta?: ModelsCartaMeta }
type PageResponse = { status: number; data: unknown }

export class CartaFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'CartaFetchError'
  }
}

/**
 * Percorre todas as páginas de um endpoint paginado da Carta. A primeira página diz
 * quantas existem; as demais saem em paralelo. Qualquer página com erro derruba o
 * resultado inteiro: uma lista ou um PDF com buracos é pior que um erro explícito.
 */
export async function fetchAllCartaPages<T>(
  fetchPage: (page: number) => Promise<PageResponse>,
  label: string
): Promise<T[]> {
  const readPage = async (page: number) => {
    const response = await fetchPage(page)
    if (response.status !== 200) {
      throw new CartaFetchError(
        `${label}: página ${page} respondeu ${response.status}`,
        response.status
      )
    }
    const body = parseCartaServicosPayload<Paged<T>>(response.data)
    if (!body) {
      throw new CartaFetchError(`${label}: página ${page} sem corpo JSON`)
    }
    return body
  }

  const first = await readPage(1)
  const totalPages = Math.min(first.meta?.total_pages ?? 1, CARTA_MAX_PAGES)
  const rest = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
      readPage(i + 2)
    )
  )

  return [first, ...rest].flatMap(page => page.data ?? [])
}

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

export type CartaOrgUnit = {
  siciCode: string
  name: string
  shortName: string
  publishedServices: number
}

/** "Nome do ente - Sigla"; sem sigla, só o nome. */
export function formatOrgUnitLabel(
  org: Pick<CartaOrgUnit, 'name' | 'shortName'>
): string {
  return org.shortName ? `${org.name} - ${org.shortName}` : org.name
}

/** Normaliza e ordena a lista: sem `siciCode` não entra; ordem alfabética pelo nome. */
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Alguns órgãos chegam com a sigla já colada ao nome, no fim ("Distribuidora de
 * Filmes S.A. - RIOFILME") ou no começo ("MULTIRIO - Empresa Municipal de
 * Multimeios Ltda."). Tira essa cópia para "Nome - Sigla" não repetir a sigla.
 * Sigla que é parte natural do nome ("Fundação Cidade das Artes") fica.
 */
export function stripShortNameFromName(
  name: string,
  shortName: string
): string {
  if (!shortName) return name
  const sigla = escapeRegExp(shortName)
  const cleaned = name
    .replace(new RegExp(`\\s+[-–]\\s+${sigla}$`, 'i'), '')
    .replace(new RegExp(`^${sigla}\\s+[-–]\\s+`, 'i'), '')
    .trim()
  return cleaned || name
}

export function toCartaOrgUnits(raw: ModelsCartaOrgUnit[]): CartaOrgUnit[] {
  const bySici = new Map<string, CartaOrgUnit>()

  for (const item of raw) {
    const siciCode = item.responsibleOrgUnitSiciCode?.trim()
    const rawName = item.responsibleOrgUnit?.trim()
    if (!siciCode || !rawName) continue
    if (item.publishedServices !== undefined && item.publishedServices < 1) {
      continue
    }
    const shortName = item.responsibleOrgUnitShortName?.trim() ?? ''
    bySici.set(siciCode, {
      siciCode,
      name: stripShortNameFromName(rawName, shortName),
      shortName,
      publishedServices: item.publishedServices ?? 0,
    })
  }

  return [...bySici.values()].sort((a, b) => collator.compare(a.name, b.name))
}

export async function fetchCartaOrgUnits(): Promise<CartaOrgUnit[]> {
  const raw = await fetchAllCartaPages<ModelsCartaOrgUnit>(
    page =>
      getApiPublicOrgUnits({ page, per_page: CARTA_PER_PAGE }, CACHE_10MIN),
    'org-units'
  )
  return toCartaOrgUnits(raw)
}

export async function fetchCartaOrgUnit(
  siciCode: string
): Promise<CartaOrgUnit | null> {
  const orgs = await fetchCartaOrgUnits()
  return orgs.find(org => org.siciCode === siciCode) ?? null
}

/**
 * Só serviços publicados e do próprio órgão. A API já filtra, mas a carta é documento
 * oficial: um rascunho ou serviço de outro órgão não pode vazar por engano do upstream.
 */
export function filterOrgUnitServices(
  services: ClientsCartaServiceDetail[],
  siciCode: string
): ClientsCartaServiceDetail[] {
  return services
    .filter(
      service =>
        service.responsibleOrgUnitSiciCode?.trim() === siciCode &&
        service.articleStatus !== 'Draft' &&
        Boolean(service.name?.trim())
    )
    .sort((a, b) => collator.compare(a.name ?? '', b.name ?? ''))
}

export async function fetchCartaOrgUnitServices(
  siciCode: string
): Promise<ClientsCartaServiceDetail[]> {
  const raw = await fetchAllCartaPages<ClientsCartaServiceDetail>(
    page =>
      getApiPublicOrgUnitsSiciCodeServices(
        siciCode,
        { page, per_page: CARTA_PER_PAGE },
        CACHE_10MIN
      ),
    `org-units/${siciCode}/services`
  )
  return filterOrgUnitServices(raw, siciCode)
}

/** Código SICI é numérico; valida antes de interpolar na URL do upstream. */
export function isValidSiciCode(value: string): boolean {
  return /^[0-9A-Za-z-]{1,32}$/.test(value)
}

/** `carta-de-servicos-{sigla}.pdf`, sigla em minúsculas e sem acento. */
export function cartaPdfFileName(
  org: Pick<CartaOrgUnit, 'shortName' | 'siciCode'>
) {
  const slug = (org.shortName || org.siciCode)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `carta-de-servicos-${slug || org.siciCode}.pdf`
}

export function cartaPdfHref(siciCode: string): string {
  return `/api/carta-de-servicos/${encodeURIComponent(siciCode)}/pdf`
}

/** URL da tela do serviço no pref.rio. */
export function cartaServiceHref(
  service: Pick<ClientsCartaServiceDetail, 'slug' | 'themeSlug'>
): string | null {
  if (!service.slug || !service.themeSlug) return null
  return `/servicos/categoria/${encodeURIComponent(service.themeSlug)}/${service.slug}`
}
