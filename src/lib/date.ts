type IsUpdateWithinProps = {
  updatedAt: string | null | undefined
  months: number
}

// Check if the given date is within the specified number of months from now
export function isUpdatedWithin({
  updatedAt,
  months,
}: IsUpdateWithinProps): boolean {
  if (!updatedAt) return false

  const updatedDate = new Date(updatedAt)
  const now = new Date()

  const limitDate = new Date(now)
  limitDate.setMonth(limitDate.getMonth() - months)

  return updatedDate >= limitDate
}
