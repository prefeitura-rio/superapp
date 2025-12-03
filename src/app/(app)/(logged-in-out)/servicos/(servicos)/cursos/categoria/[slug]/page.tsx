import { createCourseSlug } from '@/actions/courses/utils'
import { AccessibilityBadge } from '@/app/components/courses/badges'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { ModelsCurso } from '@/http-courses/models'
import {
  getCategoryIdBySlug,
  transformCategoriesToFilters,
} from '@/lib/course-category-helpers'
import {
  filterVisibleCourses,
  normalizeModalityDisplay,
} from '@/lib/course-utils'
import { getDalCategorias, getDalCourses } from '@/lib/dal'
import Image from 'next/image'
import Link from 'next/link'

interface CoursesApiResponse {
  data: {
    courses: ModelsCurso[]
    pagination: {
      limit: number
      page: number
      total: number
      total_pages: number
    }
  }
  success: boolean
}

export default async function CoursesCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: categorySlug } = await params

  // Fetch categories to get the category name and ID from slug
  let categoryName = 'Categoria'
  let categoryId: number | undefined
  let courses: ModelsCurso[] = []

  try {
    const categoriesResponse = await getDalCategorias({
      page: 1,
      pageSize: 50,
      onlyWithCourses: true,
      daysTolerance: 30,
    })
    if (categoriesResponse.status === 200 && categoriesResponse.data?.data) {
      const categoriesFilters = transformCategoriesToFilters(
        categoriesResponse.data.data
      )
      const category = categoriesFilters.find(cat => cat.value === categorySlug)
      if (category) {
        categoryName = category.label
        categoryId = category.id
      }
    }
  } catch (error) {
    console.error('Error fetching category name:', error)
  }

  // Fetch courses filtered by category
  if (categoryId) {
    try {
      const coursesResponse = await getDalCourses({
        page: 1,
        limit: 100,
        categoria_id: categoryId,
      })

      if (coursesResponse.status === 200) {
        const data = coursesResponse.data as unknown as CoursesApiResponse
        const allCourses: ModelsCurso[] = data?.data?.courses || []
        courses = filterVisibleCourses(allCourses)
      }
    } catch (error) {
      console.error('Error fetching courses by category:', error)
    }
  }

  return (
    <>
      <div className="min-h-lvh max-w-4xl mx-auto pt-20 md:pt-22 pb-20">
        <SecondaryHeader
          title={categoryName}
          className="max-w-4xl"
          showSearchButton
          searchHref="/servicos/cursos/busca"
          route="/servicos/cursos"
        />

        <section className="px-4 mt-6">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center text-center justify-center py-8">
              <ThemeAwareVideo
                source={VIDEO_SOURCES.emptyAddress}
                containerClassName="mb-6 flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
              />
              <p className="text-lg text-muted-foreground">
                Ops... nenhum curso encontrado para esta categoria
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/servicos/cursos/${createCourseSlug(
                    course.id?.toString() || '',
                    course.title || ''
                  )}`}
                  className="block"
                >
                  <div className="flex gap-3 items-center">
                    {course.cover_image && (
                      <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={course.cover_image}
                          alt={course.title || 'Curso'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2">
                        {course.title || 'Curso sem título'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.modalidade &&
                          `${normalizeModalityDisplay(course.modalidade)}`}
                        {course.workload && ` • ${course.workload}`}
                      </p>
                      <AccessibilityBadge
                        accessibility={course.accessibility}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
