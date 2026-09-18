import { cursosFaqSections } from '@/constants/faqs/cursos'
import { FaqCursosClient } from './faq-cursos-client'

export const dynamic = 'force-static'

export default function FaqPageCourses() {
  return <FaqCursosClient sections={cursosFaqSections} />
}
