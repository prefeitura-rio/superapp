'use client'

import { MyCertificatesCard } from '@/app/components/courses/certified-card'
import { SecondaryHeader } from '@/app/components/secondary-header'

export default function CoursesCertifiedPage() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader title="Certificados" />

      <div className="relative overflow-hidden mt-15 px-4">
        <MyCertificatesCard />
      </div>
    </div>
  )
}
