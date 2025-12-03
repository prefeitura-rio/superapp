// Data Access Layer (DAL)
// This file is used to cache the data fetching functions

import { getApiV1Categorias } from '@/http-courses/categorias/categorias'
import { getApiV1Courses } from '@/http-courses/courses/courses'
import { getApiV1CoursesCourseIdEnrollments } from '@/http-courses/inscricoes/inscricoes'
import type { GetApiV1CoursesParams } from '@/http-courses/models'
import { getAvatars, getCitizenCpfAvatar } from '@/http/avatars/avatars'
import {
  getCitizenCpf,
  getCitizenCpfFirstlogin,
  getCitizenCpfMaintenanceRequest,
  getCitizenCpfWallet,
} from '@/http/citizen/citizen'
import type { GetApiV1CategoriesCategorySubcategoriesParams } from '@/http-busca-search/models'
import type { GetApiV1SubcategoriesSubcategoryServicesParams } from '@/http-busca-search/models'
import {
  getApiV1CategoriesCategorySubcategories,
  getApiV1SubcategoriesSubcategoryServices,
} from '@/http-busca-search/subcategories/subcategories'
import { getHealthUnitInfo, getHealthUnitRisk } from '@/lib/health-unit'
import { addSpanEvent, withSpan } from '@/lib/telemetry'
import { revalidateTag, unstable_cache } from 'next/cache'

// Recommended caching strategy for high traffic (500K+ users/month)
// 30-minute cache provides optimal balance of performance and data freshness
export async function getDalCitizenCpfWallet(cpf: string) {
  return withSpan('dal.getCitizenCpfWallet', async span => {
    span.setAttribute('cpf.masked', `***${cpf.slice(-4)}`)
    span.setAttribute('cache.strategy', 'no-store')

    const result = await getCitizenCpfWallet(cpf, {
      cache: 'no-store',
      // next: {
      //   revalidate: 600, // 10 minutes - optimal for high traffic
      //   tags: [`wallet-${cpf}`], // Tag for selective revalidation
      // },
    })

    addSpanEvent('wallet.fetched', {
      'wallet.items_count': Array.isArray(result?.data)
        ? result.data.length
        : 0,
    })

    return result
  })
}

// User info caching (user-specific data)
// 30-minute cache since user info can be updated frequently
export async function getDalCitizenCpf(cpf: string) {
  return withSpan('dal.getCitizenCpf', async span => {
    span.setAttribute('cpf.masked', `***${cpf.slice(-4)}`)
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)

    const result = await getCitizenCpf(cpf, {
      cache: 'force-cache',
      next: {
        revalidate: 600, // 10 minutes - optimal for high traffic
        tags: [`user-info-${cpf}`], // Tag for selective revalidation
      },
    })

    addSpanEvent('user.info.fetched')

    return result
  })
}

// First login status caching (user-specific data)
// 30-minute cache since first login status can change once per user
export async function getDalCitizenCpfFirstlogin(cpf: string) {
  return withSpan('dal.getCitizenCpfFirstlogin', async span => {
    span.setAttribute('cpf.masked', `***${cpf.slice(-4)}`)
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)

    const result = await getCitizenCpfFirstlogin(cpf, {
      cache: 'force-cache',
      next: {
        revalidate: 600, // 10 minutes - optimal for high traffic
        tags: [`firstlogin-${cpf}`], // Tag for selective revalidation
      },
    })

    addSpanEvent('user.firstlogin.checked')

    return result
  })
}

// Maintenance requests caching (user-specific data)
// 30-minute cache since maintenance requests can be updated frequently
export async function getDalCitizenCpfMaintenanceRequest(
  cpf: string,
  params?: { page?: number; per_page?: number }
) {
  return withSpan('dal.getCitizenCpfMaintenanceRequest', async span => {
    span.setAttribute('cpf.masked', `***${cpf.slice(-4)}`)
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)
    if (params?.page) span.setAttribute('pagination.page', params.page)
    if (params?.per_page)
      span.setAttribute('pagination.per_page', params.per_page)

    const result = await getCitizenCpfMaintenanceRequest(cpf, params, {
      cache: 'force-cache',
      next: {
        revalidate: 600, // 10 minutes - optimal for high traffic
        tags: [`maintenance-${cpf}`], // Tag for selective revalidation
      },
    })

    addSpanEvent('maintenance.requests.fetched', {
      'requests.count': Array.isArray(result?.data) ? result.data.length : 0,
    })

    return result
  })
}

// Course enrollment caching (user-specific data)
// 5-minute cache since enrollment status can change frequently
export async function getDalCourseEnrollment(courseId: number, cpf: string) {
  return withSpan('dal.getCourseEnrollment', async span => {
    span.setAttribute('cpf.masked', `***${cpf.slice(-4)}`)
    span.setAttribute('course.id', courseId)
    span.setAttribute('cache.strategy', 'no-store')

    const result = await getApiV1CoursesCourseIdEnrollments(
      courseId,
      {
        search: cpf,
        limit: 1,
      },
      {
        cache: 'no-store',
        // next: {
        //   revalidate: 600, // 10 minutes - optimal for enrollment status changes
        //   tags: [`course-enrollment-${courseId}-${cpf}`], // Tag for selective revalidation
        // },
      }
    )

    addSpanEvent('course.enrollment.checked', {
      'enrollment.found':
        Array.isArray(result?.data) && result.data.length > 0
          ? 'true'
          : 'false',
    })

    return result
  })
}

// Health unit info caching (shared across all users)
// 1 hour cache since health unit info doesn't change frequently
export const getDalHealthUnitInfo = unstable_cache(
  async (cnes: string) => {
    return await getHealthUnitInfo(cnes)
  },
  ['health-unit-info'],
  {
    revalidate: 600, // 10 minutes
    tags: ['health-unit-info'],
  }
)

// Health unit risk caching (shared across all users)
// 5 minutes cache since risk status can change more frequently
export const getDalHealthUnitRisk = unstable_cache(
  async (cnes: string) => {
    return await getHealthUnitRisk(cnes)
  },
  ['health-unit-risk'],
  {
    revalidate: 300, // 5 minutes
    tags: ['health-unit-risk'],
  }
)

// Avatar caching functions

// Available avatars list caching (shared across all users)
// 30-minute cache since avatar list doesn't change frequently
// Using standard Next.js caching instead of unstable_cache to avoid cookie issues
export async function getDalAvatars() {
  return withSpan('dal.getAvatars', async span => {
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)

    const result = await getAvatars(
      { per_page: 100 },
      {
        cache: 'force-cache',
        next: {
          revalidate: 600, // 10 minutes
          tags: ['available-avatars'],
        },
      }
    )

    addSpanEvent('avatars.list.fetched', {
      'avatars.count': Array.isArray(result?.data) ? result.data.length : 0,
    })

    return result
  })
}

// User avatar caching (user-specific data)
// 30-minute cache since user avatar can be updated
export async function getDalCitizenCpfAvatar(cpf: string) {
  return withSpan('dal.getCitizenCpfAvatar', async span => {
    span.setAttribute('cpf.masked', `***${cpf.slice(-4)}`)
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)

    const result = await getCitizenCpfAvatar(cpf, {
      cache: 'force-cache',
      next: {
        revalidate: 600, // 10 minutes - optimal for user data
        tags: [`user-avatar-${cpf}`], // Tag for selective revalidation
      },
    })

    addSpanEvent('user.avatar.fetched')

    return result
  })
}

// Helper function to revalidate wallet data when needed
export async function revalidateDalCitizenCpfWallet(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when data changes
  // Example: after user updates their profile
  revalidateTag(`wallet-${cpf}`)
}

// Helper function to revalidate user info when needed
export async function revalidateDalCitizenCpf(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when user info changes
  // Example: after user updates their profile
  revalidateTag(`user-info-${cpf}`)
}

// Helper function to revalidate maintenance requests when needed
export async function revalidateDalCitizenCpfMaintenanceRequest(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when maintenance requests change
  // Example: after user creates a new maintenance request
  revalidateTag(`maintenance-${cpf}`)
}

// Helper function to revalidate first login status when needed
export async function revalidateDalCitizenCpfFirstlogin(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when first login status changes
  // Example: after user completes onboarding
  revalidateTag(`firstlogin-${cpf}`)
}

// Helper function to revalidate course enrollment when needed
export async function revalidateDalCourseEnrollment(
  courseId: number,
  cpf: string
) {
  // This would be called from a Server Action or API route
  // to invalidate cache when enrollment status changes
  // Example: after user cancels or enrolls in a course
  revalidateTag(`course-enrollment-${courseId}-${cpf}`)
}
// Helper function to revalidate available avatars when needed
export async function revalidateDalAvatars() {
  // This would be called from a Server Action or API route
  // to invalidate cache when avatar list changes
  // Example: after admin adds/removes avatars
  revalidateTag('available-avatars')
}

// Helper function to revalidate user avatar when needed
export async function revalidateDalCitizenCpfAvatar(cpf: string) {
  // This would be called from a Server Action or API route
  // to invalidate cache when user avatar changes
  // Example: after user updates their avatar
  revalidateTag(`user-avatar-${cpf}`)
}

// Categories caching (shared across all users)
// 30-minute cache since categories list doesn't change frequently
export async function getDalCategorias(params?: {
  page?: number
  pageSize?: number
  onlyWithCourses?: boolean
  daysTolerance?: number
}) {
  return withSpan('dal.getCategorias', async span => {
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)
    if (params?.page) span.setAttribute('pagination.page', params.page)
    if (params?.pageSize)
      span.setAttribute('pagination.page_size', params.pageSize)
    if (params?.onlyWithCourses !== undefined)
      span.setAttribute('filter.only_with_courses', params.onlyWithCourses.toString())
    if (params?.daysTolerance)
      span.setAttribute('filter.days_tolerance', params.daysTolerance)

    const result = await getApiV1Categorias(params, {
      cache: 'force-cache',
      next: {
        revalidate: 600, // 10 minutes - optimal for categories that don't change frequently
        tags: ['course-categories'],
      },
    })

    addSpanEvent('categories.fetched', {
      'categories.count':
        result.status === 200 && Array.isArray(result.data?.data)
          ? result.data.data.length
          : 0,
    })

    return result
  })
}

// Helper function to revalidate categories when needed
export async function revalidateDalCategorias() {
  // This would be called from a Server Action or API route
  // to invalidate cache when categories change
  // Example: after admin adds/removes/updates categories
  revalidateTag('course-categories')
}

// Courses search caching (shared across all users, but with different filters)
// 5-minute cache since courses can change frequently
export async function getDalCourses(params?: GetApiV1CoursesParams) {
  return withSpan('dal.getCourses', async span => {
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 300)
    if (params?.page) span.setAttribute('pagination.page', params.page)
    if (params?.limit) span.setAttribute('pagination.limit', params.limit)
    if (params?.search) span.setAttribute('search.query', params.search)
    if (params?.categoria_id)
      span.setAttribute('filter.categoria_id', params.categoria_id)
    if (params?.modalidade)
      span.setAttribute('filter.modalidade', params.modalidade)

    const result = await getApiV1Courses(params, {
      cache: 'force-cache',
      next: {
        revalidate: 300, // 5 minutes - optimal for courses that can change frequently
        tags: ['courses'],
      },
    })

    addSpanEvent('courses.fetched', {
      'courses.count':
        result.status === 200 &&
        typeof result.data === 'object' &&
        result.data !== null &&
        'data' in result.data &&
        Array.isArray(
          (result.data as { data: { courses?: unknown[] } }).data?.courses
        )
          ? (result.data as { data: { courses: unknown[] } }).data.courses
              .length
          : 0,
    })

    return result
  })
}

// Helper function to revalidate courses when needed
export async function revalidateDalCourses() {
  // This would be called from a Server Action or API route
  // to invalidate cache when courses change
  // Example: after admin creates/updates/deletes courses
  revalidateTag('courses')
}

// Subcategories caching (shared across all users)
// 10-minute cache since subcategories don't change frequently
export async function getDalCategoriesCategorySubcategories(
  category: string,
  params?: GetApiV1CategoriesCategorySubcategoriesParams
) {
  return withSpan('dal.getCategoriesCategorySubcategories', async span => {
    span.setAttribute('category', category)
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)
    if (params?.sort_by) span.setAttribute('sort_by', params.sort_by)
    if (params?.order) span.setAttribute('order', params.order)
    if (params?.include_empty !== undefined)
      span.setAttribute('include_empty', params.include_empty.toString())
    if (params?.include_inactive !== undefined)
      span.setAttribute('include_inactive', params.include_inactive.toString())

    const result = await getApiV1CategoriesCategorySubcategories(
      category,
      params,
      {
        cache: 'force-cache',
        next: {
          revalidate: 600, // 10 minutes - optimal for subcategories that don't change frequently
          tags: [`subcategories-${category}`],
        },
      }
    )

    addSpanEvent('subcategories.fetched', {
      'subcategories.count':
        result.status === 200 &&
        Array.isArray(result.data?.subcategories)
          ? result.data.subcategories.length
          : 0,
    })

    return result
  })
}

// Helper function to revalidate subcategories when needed
export async function revalidateDalCategoriesCategorySubcategories(
  category: string
) {
  // This would be called from a Server Action or API route
  // to invalidate cache when subcategories change
  // Example: after admin adds/removes/updates subcategories
  revalidateTag(`subcategories-${category}`)
}

// Services by subcategory caching (shared across all users, but with different pagination)
// 10-minute cache since services can change but not too frequently
export async function getDalSubcategoriesSubcategoryServices(
  subcategory: string,
  params?: GetApiV1SubcategoriesSubcategoryServicesParams
) {
  return withSpan('dal.getSubcategoriesSubcategoryServices', async span => {
    span.setAttribute('subcategory', subcategory)
    span.setAttribute('cache.strategy', 'force-cache')
    span.setAttribute('cache.revalidate', 600)
    if (params?.page) span.setAttribute('pagination.page', params.page)
    if (params?.per_page)
      span.setAttribute('pagination.per_page', params.per_page)
    if (params?.include_inactive !== undefined)
      span.setAttribute('include_inactive', params.include_inactive.toString())

    const result = await getApiV1SubcategoriesSubcategoryServices(
      subcategory,
      params,
      {
        cache: 'force-cache',
        next: {
          revalidate: 600, // 10 minutes - optimal for services that can change
          tags: [`subcategory-services-${subcategory}`],
        },
      }
    )

    addSpanEvent('subcategory.services.fetched', {
      'services.count':
        result.status === 200 && Array.isArray(result.data?.services)
          ? result.data.services.length
          : 0,
    })

    return result
  })
}

// Helper function to revalidate services by subcategory when needed
export async function revalidateDalSubcategoriesSubcategoryServices(
  subcategory: string
) {
  // This would be called from a Server Action or API route
  // to invalidate cache when services change
  // Example: after admin creates/updates/deletes services
  revalidateTag(`subcategory-services-${subcategory}`)
}
