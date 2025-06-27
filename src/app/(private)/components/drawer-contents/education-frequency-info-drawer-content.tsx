'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'

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
      title="Frequência Escolar"
    >
      <div className="text-sm text-popover-foreground">
        <p className="mt-3">
          Frequência escolar do aluno no último trimestre letivo.
        </p>
      </div>
    </BottomSheet>
  )
}
