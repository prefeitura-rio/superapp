'use client'

import { EditIcon } from '@/assets/icons/edit-icon'
import { InfoIcon } from '@/assets/icons/info-icon'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { useState } from 'react'

interface MeiDataItemProps {
  label: string
  value: string | string[]
  showInfo?: boolean
  showEdit?: boolean
  infoContent?: string
  infoTitle?: string
  onEditClick?: () => void
}

export function MeiDataItem({
  label,
  value,
  showInfo = false,
  showEdit = false,
  infoContent,
  infoTitle = 'Informação',
  onEditClick,
}: MeiDataItemProps) {
  const [showInfoDrawer, setShowInfoDrawer] = useState(false)

  const values = Array.isArray(value) ? value : [value]

  return (
    <>
      <div className="py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-foreground-light">{label}</span>
          {showInfo && infoContent && (
            <button
              type="button"
              onClick={() => setShowInfoDrawer(true)}
              className="text-foreground-light hover:text-foreground transition-colors"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
          )}
          {showEdit && onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="ml-auto text-foreground-light hover:text-foreground transition-colors"
            >
              <EditIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        {values.map((v, index) => (
          <span
            key={index}
            className="text-base text-foreground block"
          >
            {v}
          </span>
        ))}
      </div>

      {showInfo && infoContent && (
        <BottomSheet
          open={showInfoDrawer}
          onOpenChange={setShowInfoDrawer}
          title={infoTitle}
          showHandle
        >
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {infoContent}
          </p>
        </BottomSheet>
      )}
    </>
  )
}
