import { MyCertificatesCard } from '@/app/components/courses/certified-card'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { buildAuthUrl } from '@/constants/url'
import { getApiV1EnrollmentsUserCpf } from '@/http-courses/enrollments/enrollments'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

export default async function CoursesCertifiedPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/cursos/certificados'))
  }

  try {
    // Fetch user enrollments with pagination
    const response = await getApiV1EnrollmentsUserCpf(userInfo.cpf, {
      page: 1,
      limit: 100, // Get more enrollments to show all user courses
    })

    if (response.status !== 200) {
      console.error(
        'Failed to fetch enrollments:',
        response.status,
        response.data
      )
      throw new Error(`API returned status ${response.status}`)
    }

    const data = response.data as any

    // Extract enrollments array from the API response
    const enrollments = data?.data?.enrollments || []

    // Filter enrollments that are concluded and have certificate available
    const certificatesWithEnrollments = enrollments
      .filter(
        (enrollment: any) =>
          enrollment.status === 'concluded' &&
          enrollment.curso.has_certificate === true
      )
      .map((enrollment: any) => ({
        ...enrollment.curso,
        id: enrollment.course_id,
        title: enrollment.curso?.title || 'Curso',
        description: enrollment.curso?.description,
        imageUrl: enrollment.curso?.cover_image,
        institutionalLogo: enrollment.curso?.institutional_logo,
        provider: enrollment.curso?.organization,
        status:
          enrollment.certificate_url && enrollment.certificate_url.trim() !== ''
            ? 'certificate_available'
            : 'certificate_pending',
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        updatedAt: enrollment.updated_at,
        certificateUrl: enrollment.certificate_url,
        modalidade: enrollment.curso?.modalidade,
        workload: enrollment.curso?.workload,
        hasCertificate: enrollment.has_certificate,
      }))
      .filter((course: any) => course.id)

    return (
      <div className="max-w-4xl mx-auto py-6">
        <SecondaryHeader title="Certificados" />

        {certificatesWithEnrollments.length === 0 ? (
          <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
            <p className="block text-lg text-muted-foreground text-center">
              Você ainda não possui nenhum certificado.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden mt-16 px-4">
            <MyCertificatesCard certificates={certificatesWithEnrollments} />
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching user certificates:', error)
    // Return empty certificates array on error
    return (
      <div className="max-w-4xl mx-auto py-6">
        <SecondaryHeader title="Certificados" />
        <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
          <p className="block text-lg text-muted-foreground text-center">
            Erro ao carregar certificados. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    )
  }
}
