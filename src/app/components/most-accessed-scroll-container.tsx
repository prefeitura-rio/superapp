'use client'

import { useDragScroll } from '@/hooks/use-drag-scroll'

export function MostAccessedScrollContainer({
  children,
}: { children: React.ReactNode }) {
  const {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onDragStart,
  } = useDragScroll<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className="relative w-full overflow-x-auto pb-2 no-scrollbar select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDragStart={onDragStart}
    >
      {children}
    </div>
  )
}
