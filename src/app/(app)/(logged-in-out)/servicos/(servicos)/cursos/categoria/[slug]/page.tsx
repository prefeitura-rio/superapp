import { CourseCard } from '@/app/components/courses/courses-card'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import type { ModelsCurso } from '@/http-courses/models'
import { transformCategoriesToFilters } from '@/lib/course-category-helpers'
import { filterVisibleCourses } from '@/lib/course-utils'
import { getDalCategorias, getDalCourses } from '@/lib/dal'
import type { AccessibilityProps } from '@/types/course'
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
          className="max-w-4xl"
          showSearchButton
          searchHref="/servicos/cursos/busca"
          route="/servicos/cursos"
          logo={
            <Link href="/servicos/cursos">
              <Image
                src={oportunidadesCariocasLogoDark}
                alt="Oportunidades Cariocas"
                width={170}
                height={38}
                priority
                className="dark:block hidden"
              />
              <Image
                src={oportunidadesCariocasLogo}
                alt="Oportunidades Cariocas"
                width={170}
                height={38}
                priority
                className="dark:hidden block"
              />
            </Link>
          }
        />

        <section className="px-4 mt-2">
          <h1 className="text-3xl font-medium text-foreground pb-4">
            {categoryName}
          </h1>
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
            <div className="flex flex-col divide-y divide-border">
              {courses.map(course => (
                <CourseCard
                  key={course.id}
                  courseId={course.id}
                  title={course.title as string}
                  modality={course.modalidade as string}
                  workload={course.workload as string}
                  institutionaLogo={course.institutional_logo as string}
                  provider={course.organization as string}
                  coverImage={course.cover_image as string}
                  accessibility={course.accessibility as AccessibilityProps}
                  courseManagementType={course.course_management_type}
                  enrollmentEndDate={
                    course.enrollment_end_date ?? course.data_limite_inscricoes
                  }
                  variant="horizontal"
                  className="py-3 first:pt-0 last:pb-0"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
