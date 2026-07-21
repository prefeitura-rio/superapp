import { describe, expect, it } from 'vitest'
import { getPaginationItems } from './pagination'

describe('getPaginationItems', () => {
  describe('mobile', () => {
    it('returns start window on first page', () => {
      expect(getPaginationItems(1, 15, 'mobile')).toEqual([1, 2, 3])
    })

    it('returns neighbors around current page', () => {
      expect(getPaginationItems(2, 15, 'mobile')).toEqual([1, 2, 3])
      expect(getPaginationItems(8, 15, 'mobile')).toEqual([7, 8, 9])
    })

    it('returns end window on last page', () => {
      expect(getPaginationItems(15, 15, 'mobile')).toEqual([13, 14, 15])
    })

    it('returns all pages when total is small', () => {
      expect(getPaginationItems(1, 2, 'mobile')).toEqual([1, 2])
    })
  })

  describe('desktop', () => {
    it('returns start pattern with ellipsis', () => {
      expect(getPaginationItems(1, 15, 'desktop')).toEqual([
        1,
        2,
        3,
        4,
        'ellipsis',
        15,
      ])
    })

    it('returns middle pattern with ellipses', () => {
      expect(getPaginationItems(4, 15, 'desktop')).toEqual([
        1,
        'ellipsis',
        3,
        4,
        5,
        'ellipsis',
        15,
      ])
    })

    it('returns end pattern with ellipsis', () => {
      expect(getPaginationItems(15, 15, 'desktop')).toEqual([
        1,
        'ellipsis',
        12,
        13,
        14,
        15,
      ])
    })

    it('returns all pages when total fits without ellipsis', () => {
      expect(getPaginationItems(3, 5, 'desktop')).toEqual([1, 2, 3, 4, 5])
    })
  })
})
