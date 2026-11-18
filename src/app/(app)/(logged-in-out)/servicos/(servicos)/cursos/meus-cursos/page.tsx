import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { MyCoursesContent } from './components/my-courses-content'

export default async function MyCoursesPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/cursos/meus-cursos'))
  }

  return (
    <div>
      <OportunidadesSubHeader
        logoHref="/servicos/cursos"
        showSearchIcon
        searchUrl="/busca?tipo=cursos"
        breadcrumbItems={[
          { label: 'Página inicial', href: '/' },
          { label: 'Oportunidades Cariocas/Cursos', href: '/servicos/cursos' },
          { label: 'Meus cursos' },
        ]}
      />
      <div>
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
          <h1 className="text-base font-medium text-foreground">Meus cursos</h1>
          <MyCoursesContent />
        </div>
      </div>
    </div>
  )
}
