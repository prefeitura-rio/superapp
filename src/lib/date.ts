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
 * Parses a date string converting from UTC to Brazil/Sao_Paulo timezone (UTC-3)
 * before extracting the calendar date. This is necessary because dates are stored
 * as TIMESTAMPTZ in UTC after being converted from local time via toISOString().
 * A timestamp like "2026-08-01T02:59:59Z" is actually July 31st at 23:59:59 in
 * Brasília (UTC-3), so we must convert to the correct timezone before displaying.
 */
function parseDateLocal(dateString: string): Date {
  const date = new Date(dateString)
  // Format in Brazil/Sao_Paulo timezone to get the correct calendar date
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = Number(parts.find(p => p.type === 'year')?.value)
  const month = Number(parts.find(p => p.type === 'month')?.value)
  const day = Number(parts.find(p => p.type === 'day')?.value)
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
