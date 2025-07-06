/**
 * Determines if a place is open or closed based on operating hours
 * @param operatingHours - String in format "8:00 às 17:00" or similar
 * @returns "Aberto" if open, "Fechado" if closed
 */
export function getOperatingStatus(
  operatingHours?: string
): 'Aberto' | 'Fechado' {
  if (!operatingHours) {
    return 'Fechado'
  }

  try {
    // Extract hours from string like "8:00 às 17:00"
    const timePattern = /(\d{1,2}):(\d{2})\s+às\s+(\d{1,2}):(\d{2})/
    const match = operatingHours.match(timePattern)

    if (!match) {
      return 'Fechado'
    }

    const [, startHour, startMinute, endHour, endMinute] = match

    // Get current time in São Paulo, Brazil timezone
    const now = new Date()
    const saoPauloTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    )
    const currentHour = saoPauloTime.getHours()
    const currentMinute = saoPauloTime.getMinutes()

    const startTime =
      Number.parseInt(startHour) * 60 + Number.parseInt(startMinute)
    const endTime = Number.parseInt(endHour) * 60 + Number.parseInt(endMinute)
    const currentTime = currentHour * 60 + currentMinute

    return currentTime >= startTime && currentTime <= endTime
      ? 'Aberto'
      : 'Fechado'
  } catch (error) {
    console.error('Error parsing operating hours:', error)
    return 'Fechado'
  }
}
