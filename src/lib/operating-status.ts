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
    // Get current time in São Paulo, Brazil timezone
    const now = new Date()
    const saoPauloTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    )
    const currentDay = saoPauloTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Always closed on weekends
    if (currentDay === 0 || currentDay === 6) {
      return 'Fechado'
    }

    // Extract hours from string like "8:00 às 17:00"
    const timePattern = /(\d{1,2}):(\d{2})\s+às\s+(\d{1,2}):(\d{2})/
    const match = operatingHours.match(timePattern)

    if (!match) {
      return 'Fechado'
    }

    const [, startHour, startMinute, endHour, endMinute] = match

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

/**
 * Format the operating hours to show when it opens next if closed
 * @param operatingHours - String in format "8:00 às 17:00" or similar
 * @returns Formatted string showing next opening time
 */
export function formatEducationOperatingHours(operatingHours?: string): string {
  if (!operatingHours) {
    return 'Não informado'
  }

  const status = getOperatingStatus(operatingHours)

  // If it's open, return the original hours
  if (status === 'Aberto') {
    return operatingHours
  }

  try {
    // Extract hours from string like "8:00 às 17:00"
    const timePattern = /(\d{1,2}):(\d{2})\s+às\s+(\d{1,2}):(\d{2})/
    const match = operatingHours.match(timePattern)

    if (!match) {
      return operatingHours
    }

    const [, startHour, , endHour] = match

    // Get current day
    const now = new Date()
    const saoPauloTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    )
    const currentDay = saoPauloTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const formatHour = (hour: string): string => {
      const hourNum = Number.parseInt(hour)
      return `${hourNum}h`
    }

    // If it's Sunday, opens tomorrow (Monday)
    if (currentDay === 0) {
      return `Abre amanhã às ${formatHour(startHour)}`
    }

    // If it's Friday or Saturday, opens Monday
    if (currentDay === 5 || currentDay === 6) {
      return `Abre segunda às ${formatHour(startHour)}`
    }

    // If it's Monday to Thursday, opens tomorrow
    return `Abre amanhã de ${formatHour(startHour)} às ${formatHour(endHour)}`
  } catch (error) {
    console.error('Error formatting education operating hours:', error)
    return operatingHours
  }
}

/**
 * Determines if a health unit is open or closed based on operating hours
 * @param funcionamento_dia_util - Object with inicio and fim properties
 * @returns "Aberto" if open, "Fechado" if closed
 */
export function getHealthOperatingStatus(funcionamento_dia_util?: {
  inicio: number
  fim: number
}): 'Aberto' | 'Fechado' {
  if (!funcionamento_dia_util) {
    return 'Fechado'
  }

  try {
    // Get current time in São Paulo, Brazil timezone
    const now = new Date()
    const saoPauloTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    )
    const currentDay = saoPauloTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentHour = saoPauloTime.getHours()

    // Always closed on weekends
    if (currentDay === 0 || currentDay === 6) {
      return 'Fechado'
    }

    // Check if it's currently open (weekdays only, during operating hours)
    return currentHour >= funcionamento_dia_util.inicio &&
      currentHour < funcionamento_dia_util.fim
      ? 'Aberto'
      : 'Fechado'
  } catch (error) {
    console.error('Error parsing health operating hours:', error)
    return 'Fechado'
  }
}

/**
 * Format the operating hours for health units to show when it opens next if closed
 * @param funcionamento_dia_util - Object with inicio and fim properties
 * @returns Formatted string showing next opening time
 */
export function formatHealthOperatingHours(funcionamento_dia_util?: {
  inicio: number
  fim: number
}): string {
  if (!funcionamento_dia_util) {
    return 'Não informado'
  }

  const formatHour = (hour: number): string => {
    return `${hour}h`
  }

  // Get current day
  const now = new Date()
  const saoPauloTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )
  const currentDay = saoPauloTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = saoPauloTime.getHours()

  // Check if it's currently open (weekdays only, during operating hours)
  const isCurrentlyOpen =
    currentDay >= 1 &&
    currentDay <= 5 &&
    currentHour >= funcionamento_dia_util.inicio &&
    currentHour < funcionamento_dia_util.fim

  // If it's open, return the original hours
  if (isCurrentlyOpen) {
    return `${formatHour(funcionamento_dia_util.inicio)} às ${formatHour(funcionamento_dia_util.fim)}`
  }

  // If it's Sunday, opens tomorrow (Monday)
  if (currentDay === 0) {
    return `Abre amanhã às ${formatHour(funcionamento_dia_util.inicio)}`
  }

  // If it's Friday or Saturday, opens Monday
  if (currentDay === 5 || currentDay === 6) {
    return `Abre segunda às ${formatHour(funcionamento_dia_util.inicio)}`
  }

  // If it's Monday to Thursday, opens tomorrow
  return `Abre amanhã de ${formatHour(funcionamento_dia_util.inicio)} às ${formatHour(funcionamento_dia_util.fim)}`
}
