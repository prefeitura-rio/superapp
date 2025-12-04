/**
 * Calculates age from a birth date string
 * @param birthDate - Date string in format YYYY-MM-DD or ISO format
 * @returns Age as a number, or null if date is invalid
 */
export function calculateAge(
  birthDate: string | undefined | null
): number | null {
  if (!birthDate) {
    return null
  }

  try {
    const birth = new Date(birthDate)
    const today = new Date()

    // Check if date is valid
    if (Number.isNaN(birth.getTime())) {
      return null
    }

    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    // Adjust age if birthday hasn't occurred this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--
    }

    return age
  } catch (error) {
    console.error('Error calculating age:', error)
    return null
  }
}
