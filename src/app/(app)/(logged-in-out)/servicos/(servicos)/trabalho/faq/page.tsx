import { trabalhoFaqSections } from '@/constants/faqs/trabalho'
import { FaqTrabalhoClient } from './faq-trabalho-client'

export default function EmpregosFaqPage() {
  return <FaqTrabalhoClient sections={trabalhoFaqSections} />
}
