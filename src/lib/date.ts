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

export function formatTimeRange(timeRange: string | null): string {
  if (!timeRange) return ''

  const times = timeRange.trim().split('-')

  if (times.length !== 2) {
    return timeRange
  }

  const startTime = times[0].replace(':00', '')
  const endTime = times[1].replace(':00', '')

  return `${startTime}h às ${endTime}h`
}

export const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return null
  }
}
