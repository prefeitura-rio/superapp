'use client'

import googleIcon from '@/assets/google.svg'
import { JobDrawer } from '@/components/ui/custom/job-drawer'
import type { Job } from '@/types/job'
import { BookmarkIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { getJobCardColor, providerIcons } from './utils'


export default function JobCardSearchPage({
  job,
  subscribed = false,
  favorite = false,
}: { job: Job; subscribed?: boolean; favorite?: boolean }) {
  const color = getJobCardColor(job.type)
  const icon = providerIcons[job.provider] || googleIcon
  const [isSaved, setIsSaved] = useState(favorite)

  return (
    <JobDrawer
      job={job}
      color={color}
      icon={icon}
      description={job.description}
      spots={job.spots}
      requirements={job.requirements}
      subscribed={subscribed}
      favorite={favorite}
    >
      <div
        className="rounded-3xl p-5 mb-5 relative overflow-hidden flex flex-col cursor-pointer"
        style={{ height: 190, backgroundColor: color }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-white rounded-lg p-1 flex items-center justify-center">
            <Image
              src={icon}
              alt={job.provider}
              className="w-7 h-7"
              width={28}
              height={28}
              style={{ objectFit: 'contain', maxHeight: 28, maxWidth: 28 }}
            />
          </div>
          <span className="font-medium text-white flex-1">
            {job.provider}
          </span>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
          >
            <BookmarkIcon
              className={`w-5 h-5 ${isSaved ? 'text-white' : 'text-white/70'} transition-colors`}
              fill={isSaved || favorite ? 'white' : 'transparent'}
            />
          </button>
        </div>
        <div className="text-lg pt-2  text-white mb-6 line-clamp-2">
          {job.title
            .replace('para Iniciantes', 'Básico')
            .replace('Intermediário', 'Intermediário')}
        </div>
        {subscribed ? (
          <button
            type="button"
            className="bg-white text-black px-3 py-1.5 rounded-full text-sm font-medium w-fit mt-auto shadow cursor-pointer transition-colors hover:bg-black hover:text-white"
            style={{ minWidth: 0 }}
            // TODO: Add onClick logic to cancel subscription
            onClick={e => e.stopPropagation()}
          >
            Cancelar inscrição
          </button>
        ) : (
          <div className="flex gap-2 mt-auto">
            <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs font-medium">
              R${job.salary}
            </span>
            <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs font-medium">
              {job.modality}
            </span>
          </div>
        )}
      </div>
    </JobDrawer>
  )
}
