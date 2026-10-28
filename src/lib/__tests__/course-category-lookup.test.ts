import { findCourseCategoryBySlug } from '@/lib/course-category-helpers'
import { describe, expect, it } from 'vitest'

const categories = [
  { id: 1, nome: 'Dados' },
  { id: 5, nome: 'Cibersegurança' },
  { id: 46, nome: 'Rio do Futuro' },
]

describe('findCourseCategoryBySlug', () => {
  it('acha a categoria pelo slug', () => {
    expect(
      findCourseCategoryBySlug(categories, 'ciberseguranca')
    ).toMatchObject({
      status: 'found',
      category: { id: 5, label: 'Cibersegurança' },
    })
  })

  it('acha a categoria de nome composto', () => {
    expect(findCourseCategoryBySlug(categories, 'rio-do-futuro')).toMatchObject(
      { status: 'found', category: { id: 46 } }
    )
  })

  it('responde not_found para slug fora do catálogo completo', () => {
    expect(
      findCourseCategoryBySlug(
        categories,
        'categoria-cursos-inexistente-999',
        3
      )
    ).toEqual({ status: 'not_found' })
  })

  it('responde not_found sem total informado', () => {
    expect(findCourseCategoryBySlug(categories, 'inexistente')).toEqual({
      status: 'not_found',
    })
  })

  it('responde unavailable quando o catálogo veio incompleto', () => {
    expect(findCourseCategoryBySlug(categories, 'inexistente', 150)).toEqual({
      status: 'unavailable',
    })
  })

  it('responde unavailable com catálogo vazio ou ausente', () => {
    expect(findCourseCategoryBySlug([], 'dados')).toEqual({
      status: 'unavailable',
    })
    expect(findCourseCategoryBySlug(undefined, 'dados')).toEqual({
      status: 'unavailable',
    })
  })
})
