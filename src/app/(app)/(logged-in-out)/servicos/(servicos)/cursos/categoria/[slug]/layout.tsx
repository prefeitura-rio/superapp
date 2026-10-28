import { findCourseCategoryBySlug } from '@/lib/course-category-helpers'
import { getDalCategorias } from '@/lib/dal'
import { notFound } from 'next/navigation'

// Above the number of course categories in the catalog, so one page holds all.
const CATEGORIES_PAGE_SIZE = 100

/**
 * Checks that the course category exists before the page streams. The layout
 * renders above this segment's `loading.tsx`, so `notFound()` here still
 * answers a real 404; called from the page, the loading fallback would have
 * fixed the status at 200. The lookup covers every category, with courses open
 * or not, so a known category without open courses keeps its empty state.
 * When the catalog cannot be read the page renders as before.
 */
export default async function CoursesCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let isMissing = false
  try {
    const response = await getDalCategorias({
      page: 1,
      pageSize: CATEGORIES_PAGE_SIZE,
    })
    if (response.status === 200) {
      const lookup = findCourseCategoryBySlug(
        response.data?.data,
        slug,
        response.data?.meta?.total
      )
      isMissing = lookup.status === 'not_found'
    }
  } catch (error) {
    console.error('Error looking up course category:', error)
  }

  if (isMissing) {
    notFound()
  }

  return children
}
