import {
  COURSES,
  MY_CERTIFICATES,
  MY_COURSES,
  NEARBY_UNITS,
} from '@/mocks/mock-courses'
import {
  FAVORITES_KEY,
  getFavoritesFromStorage,
  simulateDelay,
} from './utils-mock'

/*
 * ================================================
 * MOCK API - CURSOS EM GERAL
 * ================================================
 */

const getAllCourses = async (): Promise<any> => {
  await simulateDelay(1000)
  return COURSES
}

const getCourseById = async (courseId: string): Promise<any> => {
  await simulateDelay(1000)
  const course = COURSES.find(c => c.id === courseId)
  return course
}

const getCoursesWithFilters = async (filters: {
  categoria?: string
  modalidade?: string
  certificado?: string
  periodo?: string
  query?: string
}) => {
  await simulateDelay(700)

  let filteredCourses = [...COURSES]

  // -------- Filtros aplicados ----------
  if (filters.query) {
    const query = filters.query.toLowerCase()
    filteredCourses = filteredCourses.filter(
      course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    )
  }

  if (filters.categoria) {
    filteredCourses = filteredCourses.filter(
      course => course.type.toLowerCase() === filters.categoria?.toLowerCase()
    )
  }

  if (filters.modalidade) {
    filteredCourses = filteredCourses.filter(
      course =>
        course.modality.toLowerCase() === filters.modalidade?.toLowerCase()
    )
  }

  if (filters.certificado) {
    const wantsCertificate = filters.certificado === 'sim'
    filteredCourses = filteredCourses.filter(
      course => Boolean(course.certificate) === wantsCertificate
    )
  }

  if (filters.periodo) {
    filteredCourses = filteredCourses.filter(
      course => course.period?.toLowerCase() === filters.periodo?.toLowerCase()
    )
  }

  return filteredCourses
}

/*
 * ================================================
 * MEUS CURSOS - CERTIFICADOS - GESTÃO PESSOAL
 * ================================================
 */

const getMyCourses = async (): Promise<any> => {
  await simulateDelay(1000)
  return MY_COURSES
}

const getCertifiedCourses = async (): Promise<any> => {
  await simulateDelay(1000)
  return MY_CERTIFICATES
}

/*
 * ================================================
 * FAVORITOS - GESTÃO DE PREFERÊNCIAS
 * ================================================
 */

const saveFavoritesToStorage = (favorites: string[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export const isFavoriteCourse = async (courseId: string): Promise<boolean> => {
  await simulateDelay(300)

  const favorites = getFavoritesFromStorage()
  return favorites.includes(courseId)
}

export const addCourseToFavorites = async (courseId: string): Promise<void> => {
  await simulateDelay()

  const favorites = getFavoritesFromStorage()

  if (!favorites.includes(courseId)) {
    const newFavorites = [...favorites, courseId]
    saveFavoritesToStorage(newFavorites)
  }
}

export const removeCourseFromFavorites = async (
  courseId: string
): Promise<void> => {
  await simulateDelay()

  const favorites = getFavoritesFromStorage()
  const newFavorites = favorites.filter(id => id !== courseId)
  saveFavoritesToStorage(newFavorites)
}

export const getAllFavoritesCourses = async (): Promise<(typeof COURSES)[]> => {
  await simulateDelay()

  // Pega Ids e filtra cursos
  const favoriteIds = getFavoritesFromStorage()
  const favoritesData = await Promise.all(
    favoriteIds.map(async (courseId: string) => {
      try {
        return await getCourseById(courseId)
      } catch (error) {
        console.error(`Erro ao carregar curso ${courseId}:`, error)
        return null
      }
    })
  )

  return favoritesData.filter(course => course !== null)
}

/*
 * ================================================
 * UNIDADES & INSCRIÇÕES
 * ================================================
 */

const getNearbyUnits = async (courseId: string): Promise<any> => {
  await simulateDelay(800)

  const nearbyUnits = NEARBY_UNITS

  return nearbyUnits
}

const getUserInfo = async (): Promise<any> => {
  await simulateDelay(500)

  return {
    cpf: '123.456.789-00',
    name: 'João da Silva',
    email: 'joao@email.com',
    phone: '(11) 91234-5678',
  }
}

const submitCourseApplication = async (
  courseId: string,
  data: any
): Promise<any> => {
  await simulateDelay(1200)

  console.log('=== INSCRIÇÃO NO CURSO ===')
  console.log('Course ID:', courseId)
  console.log('Dados da inscrição:', data)
  console.log('Timestamp:', new Date().toISOString())
  console.log('========================')

  // Simula resposta de sucesso
  return {
    success: true,
    inscriptionId: `inscr_${Math.random().toString(36).substr(2, 9)}`,
    message: 'Inscrição realizada com sucesso!',
  }
}

/*
 * ================================================
 * EXPORT DEFAULT - coursesApi
 * ================================================
 */

export default {
  // Cursos em geral
  getAllCourses,
  getCourseById,
  getCoursesWithFilters,

  // Meus cursos
  getMyCourses,
  getCertifiedCourses,

  // Favoritos
  getAllFavoritesCourses,
  isFavoriteCourse,
  addCourseToFavorites,
  removeCourseFromFavorites,

  // Unidades & Inscrições
  getNearbyUnits,
  submitCourseApplication,
  getUserInfo,
}
