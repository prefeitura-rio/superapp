import { MyCertificatesCard } from '@/app/components/courses/certified-card'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { buildAuthUrl } from '@/constants/url'
import { getApiV1EnrollmentsUserCpf } from '@/http-courses/enrollments/enrollments'
import { getUserInfoFromToken } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CoursesCertifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/cursos/certificados'))
  }

  const logo = (
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
  )

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

    const enrollments = data?.data?.enrollments || []

    // Filter enrollments that are concluded or approved and have certificate available
    const certificatesWithEnrollments = enrollments
      .filter(
        (enrollment: any) =>
          (enrollment.status === 'concluded' ||
            enrollment.status === 'approved') &&
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
        orgao_id: enrollment.curso?.orgao_id,
        // Só permite geração de certificado se status for 'concluded'
        // Se 'approved', mostra como pendente até admin marcar como concluded
        status:
          enrollment.status === 'concluded'
            ? 'certificate_available'
            : 'certificate_pending',
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        updatedAt: enrollment.updated_at,
        certificateUrl: enrollment.certificate_url,
        modalidade: enrollment.curso?.modalidade,
        workload: enrollment.curso?.workload,
        hasCertificate: enrollment.curso?.has_certificate === true,
        // Dados necessários para geração do certificado
        studentName: userInfo.name || 'Usuário',
        courseDuration: enrollment.curso?.workload || 'Duração não informada',
        // issuingOrganization será buscado pelo orgao_id no gerador se não estiver preenchido
        issuingOrganization: enrollment.curso?.organization || '',
      }))
      .filter((course: any) => course.id)

    return (
      <div className="max-w-4xl mx-auto py-6">
        <SecondaryHeader route="/servicos/cursos" logo={logo} />

        {certificatesWithEnrollments.length === 0 ? (
          <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
            <p className="block text-lg text-muted-foreground text-center">
              Você ainda não possui nenhum certificado.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden mt-16 px-4">
            <h1 className="text-base font-medium text-foreground">
              Certificados
            </h1>
            <MyCertificatesCard
              certificates={certificatesWithEnrollments}
              autoOpenCourseId={resolvedSearchParams.courseId}
            />
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching user certificates:', error)
    return (
      <div className="max-w-4xl mx-auto py-6">
        <SecondaryHeader route="/servicos/cursos" logo={logo} />
        <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
          <p className="block text-lg text-muted-foreground text-center">
            Erro ao carregar certificados. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    )
  }
}
