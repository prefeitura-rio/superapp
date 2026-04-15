import { redirect } from 'next/navigation'

interface CoursesSearchPageProps {
  searchParams: Promise<{
    q?: string
    query?: string
  }>
}

export default async function CoursesSearchPage({
  searchParams,
}: CoursesSearchPageProps) {
  const params = await searchParams
  const q = params.q || params.query || ''
  const target = q
    ? `/busca?tipo=cursos&q=${encodeURIComponent(q)}`
    : '/busca?tipo=cursos'
  redirect(target)
}
