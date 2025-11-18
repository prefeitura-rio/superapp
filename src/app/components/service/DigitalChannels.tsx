'use client'

import { CopyableItem } from './CopyableItem'

interface DigitalChannelsProps {
  channels: string[]
}

export function DigitalChannels({ channels }: DigitalChannelsProps) {
  // Don't render if no channels
  if (!channels || channels.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-medium text-foreground leading-5 tracking-normal">
        Canais de atendimento
      </h2>
      <div className="space-y-3">
        {channels.map((channel, index) => (
          <CopyableItem key={index} text={channel} truncate />
        ))}
      </div>
    </section>
  )
}
