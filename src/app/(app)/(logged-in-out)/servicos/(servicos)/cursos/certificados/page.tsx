import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CertificatesContent } from './components/certificates-content'

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

  // Enrollments são buscados client-side via TanStack Query
  // para evitar que o CDN cachei dados autenticados
  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader route="/servicos/cursos" logo={logo} />
      <CertificatesContent
        autoOpenCourseId={resolvedSearchParams.courseId}
        studentName={userInfo.name || 'Usuário'}
      />
    </div>
  )
}
