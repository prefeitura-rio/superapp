import type { VoteRequest } from '@/http-pref-rio-carta-votacao/models/voteRequest'
import { z } from 'zod'
import {
  DESCRIPTION_MAX_LENGTH,
  OTHER_REASON,
  RejectionReason,
} from './reasons'

/** Slug da Carta: só o que aparece em `data.slug` (sem barra, sem encoding). */
export const SERVICE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const reasonSchema = z.enum(
  Object.values(RejectionReason) as [RejectionReason, ...RejectionReason[]]
)

/** Corpo que o componente manda para `POST /api/servicos/{slug}/avaliacao`. */
export const serviceRatingRequestSchema = z.discriminatedUnion('vote', [
  z.object({
    vote: z.literal('up'),
    articleId: z.string().regex(/^[a-zA-Z0-9]{15,18}$/),
  }),
  z.object({
    vote: z.literal('down'),
    articleId: z.string().regex(/^[a-zA-Z0-9]{15,18}$/),
    rejectionReasons: z.array(reasonSchema).min(1).max(12),
    rejectionDescription: z.string().max(DESCRIPTION_MAX_LENGTH).optional(),
  }),
])

export type ServiceRatingRequest = z.infer<typeof serviceRatingRequestSchema>

export type ServiceRatingErrorCode =
  | 'invalid_payload'
  | 'not_found'
  | 'rate_limited'
  | 'unavailable'

/**
 * Monta o corpo do Apex. O comentário só vai com "Outro motivo" marcado e
 * preenchido; motivos repetidos são removidos aqui também.
 */
export function toVoteRequest(
  input: ServiceRatingRequest,
  voterToken: string
): VoteRequest {
  if (input.vote === 'up') {
    return { vote: 'up', articleId: input.articleId, voterToken }
  }

  const rejectionReasons = [...new Set(input.rejectionReasons)]
  const description = input.rejectionDescription?.trim()
  const withDescription = rejectionReasons.includes(OTHER_REASON) && description

  return {
    vote: 'down',
    articleId: input.articleId,
    voterToken,
    rejectionReasons,
    ...(withDescription ? { rejectionDescription: description } : {}),
  }
}
