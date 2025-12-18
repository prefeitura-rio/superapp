'use client'

import Image from 'next/image'

export interface MeiAttachment {
  id: number
  url: string
  thumbnail: string
  name: string
}

interface AttachmentGalleryProps {
  attachments: MeiAttachment[]
  onImageClick?: (index: number) => void
}

export function AttachmentGallery({
  attachments,
  onImageClick,
}: AttachmentGalleryProps) {
  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm text-foreground-light px-4">Anexos</h2>

      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pl-4 pb-2">
          {attachments.map((attachment, index) => (
            <button
              type="button"
              key={attachment.id}
              onClick={() => onImageClick?.(index)}
              className="flex-shrink-0 w-[120px] h-[90px] rounded-lg overflow-hidden bg-card relative group cursor-pointer"
            >
              <Image
                src={attachment.thumbnail}
                alt={attachment.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          <div className="flex-shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
