import { faqSections } from '@/constants/faqs/pref-rio'
import { FaqPrefRioClient } from './faq-prefrio-client'

export default function FaqPagePrefRio() {
  return <FaqPrefRioClient sections={faqSections} />
}
