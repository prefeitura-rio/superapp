import { cursosFaqSections } from '@/constants/faqs/cursos'
import { FaqCursosClient } from './faq-cursos-client'

export default function FaqPageCourses() {
  return <FaqCursosClient sections={cursosFaqSections} />
}
