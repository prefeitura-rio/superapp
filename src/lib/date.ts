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

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const UTC_MIDNIGHT_PATTERN = /^(\d{4}-\d{2}-\d{2})T00:00:00(\.\d{1,3})?Z?$/

function parseCalendarDate(datePart: string): Date {
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Parses a date string for display as a calendar date in pt-BR.
 *
 * Date-only strings and UTC midnight timestamps are treated as calendar dates
 * without timezone shift (e.g. "2026-08-08" and "2026-08-08T00:00:00Z" → Aug 8).
 *
 * Timestamps with a meaningful time component are converted to America/Sao_Paulo
 * before extracting the calendar date. This handles values stored as TIMESTAMPTZ
 * in UTC after local-time conversion via toISOString() — e.g.
 * "2026-08-01T02:59:59Z" is July 31st at 23:59:59 in Brasília (UTC-3).
 */
function parseDateLocal(dateString: string): Date {
  const dateOnlyMatch = dateString.match(DATE_ONLY_PATTERN)
  if (dateOnlyMatch) {
    return parseCalendarDate(dateOnlyMatch[0])
  }

  const utcMidnightMatch = dateString.match(UTC_MIDNIGHT_PATTERN)
  if (utcMidnightMatch) {
    return parseCalendarDate(utcMidnightMatch[1])
  }

  const date = new Date(dateString)
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
