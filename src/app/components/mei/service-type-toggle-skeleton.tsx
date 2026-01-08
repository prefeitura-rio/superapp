'use client'

import { Skeleton } from '@/components/ui/skeleton'

type ServiceType = 'mei' | 'cursos'

interface ServiceTypeToggleSkeletonProps {
  activeType?: ServiceType
}

export function ServiceTypeToggleSkeleton({
  activeType = 'cursos',
}: ServiceTypeToggleSkeletonProps) {
  return (
    <div className="flex items-center bg-card rounded-full p-1 w-full">
      <Skeleton
        className={`flex-1 h-9 rounded-full ${activeType === 'mei' ? '' : 'opacity-40'}`}
      />
      <Skeleton
        className={`flex-1 h-9 rounded-full ${activeType === 'cursos' ? '' : 'opacity-40'}`}
      />
    </div>
  )
}
