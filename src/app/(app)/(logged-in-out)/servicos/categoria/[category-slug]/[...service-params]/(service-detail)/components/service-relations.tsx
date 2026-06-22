'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface RelationItem {
  id: string
  title: string
  short_desc?: string | null
  url?: string | null
  reason?: string | null
}

interface RelationsData {
  recommendations: RelationItem[]
  journey: { theme: string | null; next_steps: RelationItem[] }
  cluster: { services: RelationItem[] }
}

function RelationCard({ item }: { item: RelationItem }) {
  return (
    <Link
      href={item.url || '#'}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/70"
    >
      <div className="line-clamp-2 text-sm font-medium text-card-foreground">
        {item.title}
      </div>
      {item.short_desc && (
        <div className="line-clamp-2 pt-1 text-xs text-muted-foreground">
          {item.short_desc}
        </div>
      )}
      {item.reason && (
        <div className="pt-1 text-[11px] italic text-primary/70">
          {item.reason}
        </div>
      )}
    </Link>
  )
}

function RelationSection({
  title,
  items,
  keyPrefix,
}: {
  title: string
  items: RelationItem[]
  keyPrefix: string
}) {
  if (items.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <RelationCard key={`${keyPrefix}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  )
}

export function ServiceRelations({ slug }: { slug?: string | null }) {
  const [data, setData] = useState<RelationsData | null>(null)

  useEffect(() => {
    if (!slug) return
    let active = true
    fetch(`/api/services/${encodeURIComponent(slug)}/relations`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (active && json) setData(json as RelationsData)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [slug])

  if (!data) return null

  const { recommendations, journey, cluster } = data
  const journeyTitle = journey.theme
    ? `Próximos passos · jornada ${journey.theme}`
    : 'Próximos passos'

  if (
    recommendations.length === 0 &&
    journey.next_steps.length === 0 &&
    cluster.services.length === 0
  ) {
    return null
  }

  return (
    <div className="mt-8 space-y-8 border-t border-border pt-8">
      <RelationSection
        title={journeyTitle}
        items={journey.next_steps}
        keyPrefix="journey"
      />
      <RelationSection
        title="Serviços relacionados"
        items={recommendations}
        keyPrefix="rec"
      />
      <RelationSection
        title="Do mesmo grupo temático"
        items={cluster.services.slice(0, 6)}
        keyPrefix="cluster"
      />
    </div>
  )
}
