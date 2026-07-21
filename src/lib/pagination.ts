export type PaginationItem = number | 'ellipsis'
export type PaginationVariant = 'mobile' | 'desktop'

/**
 * Builds the page items for the Figma paging component.
 *
 * Mobile:
 * - Start: 1 2 3
 * - Middle: n-1 n n+1
 * - End: last-2 last-1 last
 *
 * Desktop:
 * - Always show first and last when there are gaps
 * - Show neighbors around the current page with ellipsis
 */
export function getPaginationItems(
  page: number,
  totalPages: number,
  variant: PaginationVariant
): PaginationItem[] {
  if (totalPages <= 0) return []
  if (totalPages === 1) return [1]

  const current = Math.min(Math.max(page, 1), totalPages)

  if (variant === 'mobile') {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (current <= 1) return [1, 2, 3]
    if (current >= totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages]
    }
    return [current - 1, current, current + 1]
  }

  // Desktop
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: PaginationItem[] = []
  const showLeftEllipsis = current > 3
  const showRightEllipsis = current < totalPages - 2

  items.push(1)

  if (!showLeftEllipsis) {
    // Near start: 1 2 3 4 ... last
    for (let i = 2; i <= 4; i++) items.push(i)
    items.push('ellipsis')
    items.push(totalPages)
    return items
  }

  if (!showRightEllipsis) {
    // Near end: 1 ... last-3 last-2 last-1 last
    items.push('ellipsis')
    for (let i = totalPages - 3; i <= totalPages; i++) items.push(i)
    return items
  }

  // Middle: 1 ... current-1 current current+1 ... last
  items.push('ellipsis')
  items.push(current - 1, current, current + 1)
  items.push('ellipsis')
  items.push(totalPages)
  return items
}
