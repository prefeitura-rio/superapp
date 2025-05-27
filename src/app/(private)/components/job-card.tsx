'use client'

import { Badge } from '@/components/ui/badge'
import { JobDrawer } from '@/components/ui/custom/job-drawer'
import { BookmarkIcon } from 'lucide-react'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'
import { useState } from 'react'

interface JobCardProps {
  id: number
  title: string
  modality: string
  color?: string
  provider?: string
  description?: string
  spots?: number
  icon?: string | StaticImageData
  status: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
  requirements?: string[]
  salary?: number
  publishedAt?: string
}

export default function JobCard({
  id,
  title,
  modality,
  provider = '',
  color = '#fff',
  icon = '',
  status,
  type,
  recommended,
  recentlyAdded,
  description,
  spots,
  requirements,
  salary,
  publishedAt,
}: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  const job = {
    id,
    title,
    status,
    provider,
    modality,
    type,
    recommended,
    recentlyAdded,
    spots,
    description,
    requirements,
    salary,
    publishedAt,
  }

  return (
    <JobDrawer
      job={job}
      color={color}
      icon={icon as string}
      description={description}
      spots={spots}
      requirements={requirements}
    >
      <div
        className="rounded-xl p-4 flex flex-col items-start justify-between w-[170px] h-[170px] min-w-[170px] max-w-[170px] min-h-[170px] max-h-[170px] cursor-pointer"
        style={{ backgroundColor: color }}
      >
        <div className="flex justify-between w-full">
          <div className="flex flex-row justify-start items-center gap-1">
            <div
              className="bg-white rounded-lg p-1.5 flex items-center justify-center"
              style={{ height: 40, maxHeight: 40 }}
            >
              {icon && (
                <Image
                  src={icon || '/placeholder.svg'}
                  alt={`Logo do ${provider || 'fornecedor'}`}
                  width={28}
                  height={28}
                  style={{ objectFit: 'contain', maxHeight: 28, maxWidth: 28 }}
                />
              )}
            </div>
            <span className="text-white text-xs">{provider}</span>
          </div>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
            className="focus:outline-none"
          >
            <BookmarkIcon
              className={`w-5 h-5 ${isSaved ? 'text-white' : 'text-white/70'} transition-colors`}
              fill={isSaved ? 'white' : 'transparent'}
            />
          </button>
        </div>

        <h3 className="text-md line-clamp-2 leading-5 text-white mb-2">
          {title}
        </h3>
        <div className="w-full">
          <div className="flex gap-1">
            <Badge className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
              {modality}
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-0.5 rounded-full">
             R$ {salary}
            </Badge>
          </div>
        </div>
      </div>
    </JobDrawer>
  )
}
