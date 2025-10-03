'use client'

import Link from 'next/link'

interface Tab {
  id: string
  label: string
  href: string
}

interface SliderTabsProps {
  tabs: Tab[]
  activeTabId: string
}

export function SliderTabs({ tabs, activeTabId }: SliderTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTabId)

  return (
    <div className="relative inline-flex bg-card rounded-full p-1 w-full justify-center h-[52px] items-center">
      {/* Background slider */}
      <div
        className="absolute top-1 bottom-1 bg-secondary rounded-full transition-all duration-300 ease-in-out shadow-sm"
        style={{
          left: `calc(${activeIndex} * (100% / ${tabs.length}) + 4px)`,
          width: `calc(100% / ${tabs.length} - 8px)`,
        }}
      />

      {tabs.map(tab => (
        <Link
          key={tab.id}
          href={tab.href}
          className="relative z-10 flex-1 px-6 py-2 text-sm rounded-full transition-colors duration-300 text-center text-foreground"
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
