import { describe, expect, test } from 'vitest'
import { serviceRatingRequestSchema, toVoteRequest } from '../request'

const ARTICLE_ID = 'ka089000000BUO5AAO'

describe('serviceRatingRequestSchema', () => {
  test('aceita like sem motivos', () => {
    expect(
      serviceRatingRequestSchema.safeParse({
        vote: 'up',
        articleId: ARTICLE_ID,
      }).success
    ).toBe(true)
  })

  test('recusa dislike sem motivo', () => {
    const result = serviceRatingRequestSchema.safeParse({
      vote: 'down',
      articleId: ARTICLE_ID,
      rejectionReasons: [],
    })
    expect(result.success).toBe(false)
  })

  test('recusa motivo fora da lista e label no lugar do API name', () => {
    for (const reason of ['Foo', 'Informação incorreta']) {
      const result = serviceRatingRequestSchema.safeParse({
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: [reason],
      })
      expect(result.success).toBe(false)
    }
  })

  test('recusa comentário acima de 500 caracteres', () => {
    const result = serviceRatingRequestSchema.safeParse({
      vote: 'down',
      articleId: ARTICLE_ID,
      rejectionReasons: ['Outro_motivo'],
      rejectionDescription: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  test('recusa articleId malformado', () => {
    const result = serviceRatingRequestSchema.safeParse({
      vote: 'up',
      articleId: 'abc',
    })
    expect(result.success).toBe(false)
  })
})

describe('toVoteRequest', () => {
  test('like vai só com articleId, vote e voterToken', () => {
    expect(toVoteRequest({ vote: 'up', articleId: ARTICLE_ID }, 'sid')).toEqual(
      { vote: 'up', articleId: ARTICLE_ID, voterToken: 'sid' }
    )
  })

  test('remove motivos repetidos', () => {
    const request = toVoteRequest(
      {
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: ['Informacao_incorreta', 'Informacao_incorreta'],
      },
      'sid'
    )
    expect(request).toEqual({
      vote: 'down',
      articleId: ARTICLE_ID,
      voterToken: 'sid',
      rejectionReasons: ['Informacao_incorreta'],
    })
  })

  test('comentário só vai com "Outro motivo" marcado e preenchido', () => {
    const withOther = toVoteRequest(
      {
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: ['Outro_motivo'],
        rejectionDescription: '  O endereço mudou.  ',
      },
      'sid'
    )
    expect(withOther).toMatchObject({
      rejectionDescription: 'O endereço mudou.',
    })

    const withoutOther = toVoteRequest(
      {
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: ['Dificil_de_entender'],
        rejectionDescription: 'não deveria ir',
      },
      'sid'
    )
    expect(withoutOther).not.toHaveProperty('rejectionDescription')

    const blank = toVoteRequest(
      {
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: ['Outro_motivo'],
        rejectionDescription: '   ',
      },
      'sid'
    )
    expect(blank).not.toHaveProperty('rejectionDescription')
  })
})
