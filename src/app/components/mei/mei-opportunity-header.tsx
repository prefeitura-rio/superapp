'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { IconButton } from '@/components/ui/custom/icon-button'
import { getBackRoute } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface MeiOpportunityHeaderProps {
  title: string
  coverImage?: string
}

export function MeiOpportunityHeader({
  title,
  coverImage,
}: MeiOpportunityHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    const backRoute = getBackRoute('/servicos/mei/')
    router.push(backRoute)
  }

  return (
    <div className="h-[320px] md:h-[380px] w-full relative">
      <div className="flex justify-start">
        <IconButton
          icon={ChevronLeftIcon}
          className="top-4 left-4 absolute z-10"
          onClick={handleBack}
        />
      </div>

      {coverImage ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary/40">
            {title.charAt(0)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
        <h1 className="text-white font-bold text-2xl md:text-3xl leading-snug">
          {title}
        </h1>
      </div>
    </div>
  )
}
