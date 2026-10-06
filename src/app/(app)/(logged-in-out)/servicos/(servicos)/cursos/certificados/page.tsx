import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
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

  return (
    <div>
      <OportunidadesSubHeader
        menuHref="/servicos/cursos/opcoes"
        logoHref="/servicos/cursos"
        showSearchIcon
        searchUrl="/busca?tipo=cursos"
      />
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--card) 0%, var(--background) 100%) top / 100% 210px no-repeat',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
          <CertificatesContent
            autoOpenCourseId={resolvedSearchParams.courseId}
            studentName={userInfo.name || 'Usuário'}
          />
        </div>
      </div>
    </div>
  )
}
