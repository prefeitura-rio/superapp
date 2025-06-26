'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

interface EducationFrequencyInfoDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EducationFrequencyInfoDrawerContent({
  open,
  onOpenChange,
}: EducationFrequencyInfoDrawerContentProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="p-8 max-w-md mx-auto !rounded-t-3xl"
      showHandle
    >
      <DrawerHeader className="sr-only">
        <DrawerTitle>Frequência Escolar</DrawerTitle>
      </DrawerHeader>

      <div className="text-sm text-popover-foreground">
        <p className="mt-3">
          Frequência escolar do aluno no último trimestre letivo.
        </p>
      </div>
    </BottomSheet>
  )
}
