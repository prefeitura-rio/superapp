import { getApiV1CoursesCourseId } from '@/http-courses/courses/courses'
import type { ModelsCurso } from '@/http-courses/models'
import { FAVORITES_KEY, getFavoritesFromStorage } from './utils'

/*
 * ================================================
 * FAVORITOS - GESTÃO DE PREFERÊNCIAS
 * ================================================
 */

const saveFavoritesToStorage = (favorites: string[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export const getAllFavoritesCourses = async (): Promise<ModelsCurso[]> => {
  // Pega IDs dos favoritos do localStorage
  const favoriteIds = getFavoritesFromStorage()

  // Busca cada curso da API usando os IDs
  const favoritesData = await Promise.all(
    favoriteIds.map(async (courseId: string) => {
      try {
        const response = await getApiV1CoursesCourseId(
          Number.parseInt(courseId)
        )
        if (response.status === 200 && response.data) {
          return response.data
        }
        return null
      } catch (error) {
        console.error(`Erro ao carregar curso ${courseId}:`, error)
        return null
      }
    })
  )

  return favoritesData.filter(
    (course): course is ModelsCurso => course !== null
  )
}

/*
 * ================================================
 * EXPORT DEFAULT - coursesApi
 * ================================================
 */

export default {
  // Favoritos
  getAllFavoritesCourses,
}
