'use client'

import { ChevronLeftIcon, EditIcon, TrashIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import { getBackRoute } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface MeiOpportunityHeaderProps {
  title: string
  coverImage?: string
  showDeleteButton?: boolean
  showEditButton?: boolean
  onDeleteClick?: () => void
  onEditClick?: () => void
}

export function MeiOpportunityHeader({
  title,
  coverImage,
  showDeleteButton,
  showEditButton,
  onDeleteClick,
  onEditClick,
}: MeiOpportunityHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    const backRoute = getBackRoute('/servicos/mei/')
    router.push(backRoute)
  }

  return (
    <div className="h-[320px] md:h-[380px] w-full relative">
      <div className="flex justify-between absolute top-4 left-4 right-4 z-10">
        <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
        {(showEditButton || showDeleteButton) && (
          <div className="flex items-center gap-2">
            {showEditButton && (
              <CustomButton
                variant="secondary"
                icon={EditIcon}
                iconPosition="left"
                className="rounded-full hover:bg-card"
                onClick={onEditClick}
              >
                Editar
              </CustomButton>
            )}
            {showDeleteButton && (
              <IconButton icon={TrashIcon} onClick={onDeleteClick} />
            )}
          </div>
        )}
      </div>

      {coverImage ? (
        <Image src={coverImage} alt={title} fill className="object-cover" />
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
