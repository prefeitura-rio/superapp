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

/**
 * Parses a date string without UTC shift.
 * Extracts the YYYY-MM-DD portion and constructs a Date in local time,
 * so a value like "2026-08-08T00:00:00Z" always yields August 8th regardless
 * of the browser timezone.
 */
function parseDateLocal(dateString: string): Date {
  const datePart = dateString.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null
  try {
    const date = parseDateLocal(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return null
  }
}

/**
 * Format a Unix timestamp (in seconds) to Brazilian date format (DD/MM/YYYY)
 * @param timestamp - Unix timestamp in **seconds**
 * @returns Formatted date string or null if invalid
 */
export const formatTimestamp = (
  timestamp: number | string | null
): string | null => {
  if (!timestamp) return null

  try {
    // Convert to number if it's a string
    const numericTimestamp =
      typeof timestamp === 'string' ? Number(timestamp) : timestamp

    // Check if it's a valid number
    if (Number.isNaN(numericTimestamp)) return null

    // Convert seconds to milliseconds (JavaScript Date expects milliseconds)
    const date = new Date(numericTimestamp * 1000)

    // Check if date is valid
    if (Number.isNaN(date.getTime())) return null

    return date.toLocaleDateString('pt-BR')
  } catch {
    return null
  }
}
