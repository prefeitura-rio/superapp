import type { ClientsCartaServiceDetail } from '@/http-app-catalogo/models/clientsCartaServiceDetail'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { mapServiceDetailToPrefRioService } from '@/lib/carta-servicos/mappers'
import { sanitizePrefRioServiceHtml } from '@/lib/carta-servicos/sanitize-service-html'
import type { ServiceTicketFlags } from '@/lib/carta-servicos/types'
import { z } from 'zod'

const SHORT_TEXT_MAX = 2_000
const HTML_TEXT_MAX = 20_000

const shortText = z.string().max(SHORT_TEXT_MAX).nullish()
const htmlText = z.string().max(HTML_TEXT_MAX).nullish()
const optionalNumber = z.number().nullish()
const optionalBoolean = z.boolean().nullish()

const buttonSchema = z.object({
  description: shortText,
  enabled: optionalBoolean,
  order: optionalNumber,
  title: shortText,
  url: shortText,
})

const channelSchema = z.object({
  channelType: shortText,
  enabled: optionalBoolean,
  endereco: shortText,
  mapUrl: shortText,
  order: optionalNumber,
  titulo: shortText,
  type: shortText,
  value: shortText,
  whatsappLink: shortText,
})

const howToRequestSchema = z.object({
  exclusions: htmlText,
  instructions: htmlText,
  requiredDocs: z.array(htmlText).max(50).optional(),
  serviceResult: htmlText,
})

const legislationSchema = z.object({
  order: optionalNumber,
  titulo: htmlText,
})

const flagsSchema = z.object({
  activeCategoryConfigId: shortText,
  activeCategoryName: shortText,
  allowTicketSubmission: optionalBoolean,
  allowsAnonymity: optionalBoolean,
})

const infoSchema = z.object({
  cost: shortText,
  costNotes: htmlText,
  costValue: optionalNumber,
  fullDescription: htmlText,
  isFree: optionalBoolean,
  serviceDeadline: shortText,
  serviceDeadlineNotes: htmlText,
  summary: htmlText,
  targetAudience: z.array(shortText).max(50).optional(),
})

export const cartaServiceDetailSchema = z.object({
  version: z.literal(1).nullish(),
  articleId: shortText,
  articleStatus: shortText,
  articleVersion: optionalNumber,
  buttons: z.array(buttonSchema).max(20).optional(),
  channels: z.array(channelSchema).max(50).optional(),
  createdDate: shortText,
  flags: flagsSchema.optional(),
  howToRequest: howToRequestSchema.optional(),
  info: infoSchema.optional(),
  lastModifiedDate: shortText,
  lastPublishedDate: shortText,
  legislation: z.array(legislationSchema).max(50).optional(),
  name: shortText,
  responsibleOrgUnit: shortText,
  responsibleOrgUnitShortName: shortText,
  serviceCatalogId: shortText,
  servicePoints: z.array(z.record(z.string(), z.unknown())).max(20).optional(),
  slug: shortText,
  slugHistory: z.array(shortText).max(50).optional(),
  subthemeName: shortText,
  subthemeSlug: shortText,
  themeName: shortText,
  themeSlug: shortText,
})

function withoutNulls(detail: z.infer<typeof cartaServiceDetailSchema>) {
  return JSON.parse(
    JSON.stringify(detail, (_key, value) =>
      value === null ? undefined : value
    )
  ) as ClientsCartaServiceDetail
}

export interface ServicePreviewResponse {
  service: ModelsPrefRioService
  orgaoGestorName: string | null
  categorySlug: string
  ticketFlags?: ServiceTicketFlags
}

export function prepareServicePreview(
  detail: z.infer<typeof cartaServiceDetailSchema>
): ServicePreviewResponse {
  const clean = withoutNulls(detail)
  const service = sanitizePrefRioServiceHtml(
    mapServiceDetailToPrefRioService(clean)
  )
  const flags = clean.flags
  const ticketFlags = flags?.activeCategoryConfigId
    ? {
        allowTicketSubmission: flags.allowTicketSubmission,
        allowsAnonymity: flags.allowsAnonymity,
        activeCategoryConfigId: flags.activeCategoryConfigId,
      }
    : undefined

  return {
    service,
    orgaoGestorName: service.orgao_gestor?.[0] ?? null,
    categorySlug: clean.themeSlug ?? '',
    ticketFlags,
  }
}
