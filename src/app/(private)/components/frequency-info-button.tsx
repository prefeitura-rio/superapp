'use client'

import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'
import { useState } from 'react'
import { EducationFrequencyInfoDrawerContent } from './drawer-contents/education-frequency-info-drawer-content'

export function FrequencyInfoButton() {
  const [showFrequencySheet, setShowFrequencySheet] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Frequência Escolar Info"
        className="hover:bg-transparent hover:cursor-pointer h-4 w-4 p-0"
        onClick={() => setShowFrequencySheet(true)}
      >
        <InfoIcon className="h-3 w-3 text-foreground-light" />
      </Button>

      <EducationFrequencyInfoDrawerContent
        open={showFrequencySheet}
        onOpenChange={setShowFrequencySheet}
      />
    </>
  )
}
