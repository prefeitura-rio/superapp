import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { MyCoursesBackButton } from './components/back-button'
import { MyCoursesContent } from './components/my-courses-content'

export default async function MyCoursesPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/cursos/meus-cursos'))
  }

  // Enrollments are fetched client-side via TanStack Query
  // to avoid CDN caching authenticated data
  return (
    <div className="max-w-4xl mx-auto py-6">
      <MyCoursesBackButton />
      <div className="relative overflow-hidden mt-16 px-4">
        <h1 className="text-base font-medium text-foreground">Meus cursos</h1>
        <MyCoursesContent />
      </div>
    </div>
  )
}
