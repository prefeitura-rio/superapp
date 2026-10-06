import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  type VisitedCourse,
  addVisitedCourse,
  clearVisitedCourses,
  getVisitedCourses,
  removeVisitedCourse,
} from '../course-history'

const KEY = 'courses-visited-history'

function seed(courses: VisitedCourse[]) {
  localStorage.setItem(KEY, JSON.stringify(courses))
}

describe('course-history', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  describe('getVisitedCourses', () => {
    test('retorna [] quando não há histórico', () => {
      expect(getVisitedCourses()).toEqual([])
    })

    test('ordena por visitedAt desc (mais recente primeiro)', () => {
      seed([
        { id: 1, title: 'A', visitedAt: 100 },
        { id: 2, title: 'B', visitedAt: 300 },
        { id: 3, title: 'C', visitedAt: 200 },
      ])
      expect(getVisitedCourses().map(c => c.id)).toEqual([2, 3, 1])
    })

    test('limpa e retorna [] quando o JSON armazenado é inválido', () => {
      localStorage.setItem(KEY, '{json-invalido')
      expect(getVisitedCourses()).toEqual([])
      expect(localStorage.getItem(KEY)).toBeNull()
    })
  })

  describe('addVisitedCourse', () => {
    test('adiciona um curso com timestamp', () => {
      addVisitedCourse({ id: 1, title: 'Curso A' })
      const list = getVisitedCourses()
      expect(list).toHaveLength(1)
      expect(list[0]).toMatchObject({ id: 1, title: 'Curso A' })
      expect(typeof list[0].visitedAt).toBe('number')
    })

    test('não duplica: readicionar o mesmo curso move para o topo', () => {
      seed([
        { id: 1, title: 'A', visitedAt: 1 },
        { id: 2, title: 'B', visitedAt: 2 },
      ])
      addVisitedCourse({ id: 1, title: 'A' })
      const list = getVisitedCourses()
      expect(list).toHaveLength(2)
      // Reinserido com timestamp atual (maior) → ordenado no topo
      expect(list[0].id).toBe(1)
    })

    test('mantém no máximo 10 itens no histórico', () => {
      for (let i = 1; i <= 12; i++) {
        addVisitedCourse({ id: i, title: `Curso ${i}` })
      }
      expect(getVisitedCourses()).toHaveLength(10)
    })
  })

  describe('removeVisitedCourse', () => {
    test('remove um curso específico por id', () => {
      seed([
        { id: 1, title: 'A', visitedAt: 1 },
        { id: 2, title: 'B', visitedAt: 2 },
      ])
      removeVisitedCourse(1)
      expect(getVisitedCourses().map(c => c.id)).toEqual([2])
    })
  })

  describe('clearVisitedCourses', () => {
    test('limpa todo o histórico', () => {
      seed([{ id: 1, title: 'A', visitedAt: 1 }])
      clearVisitedCourses()
      expect(getVisitedCourses()).toEqual([])
    })
  })
})
