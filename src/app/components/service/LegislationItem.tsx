'use client'

import { CopyableItem } from './CopyableItem'

interface LegislationItemProps {
  text: string
}

export function LegislationItem({ text }: LegislationItemProps) {
  return <CopyableItem text={text} />
}
