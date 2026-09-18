import { trabalhoFaqSections } from '@/constants/faqs/trabalho'
import { FaqTrabalhoClient } from './faq-trabalho-client'

export const dynamic = 'force-static'

export default function EmpregosFaqPage() {
  return <FaqTrabalhoClient sections={trabalhoFaqSections} />
}
