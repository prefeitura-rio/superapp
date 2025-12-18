'use client'

import { MarkdownRenderer } from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/components/markdown-renderer'

interface LegislationItemProps {
  text: string
}

export function LegislationItem({ text }: LegislationItemProps) {
  return (
    <div className="bg-card rounded-2xl py-4 px-6">
      <MarkdownRenderer
        content={text}
        className="text-sm leading-5 font-normal"
      />
    </div>
  )
}
