const COURSE_HISTORY_KEY = 'courses-visited-history'
const MAX_HISTORY_ITEMS = 10

export interface VisitedCourse {
  id: number
  title: string
  cover_image?: string
  organization?: string
  modalidade?: string
  workload?: string
  visitedAt: number // timestamp
}

/**
 * Get visited courses from localStorage
 */
export function getVisitedCourses(): VisitedCourse[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(COURSE_HISTORY_KEY)
    if (!stored) return []
    const courses = JSON.parse(stored) as VisitedCourse[]
    // Sort by most recent first
    return courses.sort((a, b) => b.visitedAt - a.visitedAt)
  } catch {
    localStorage.removeItem(COURSE_HISTORY_KEY)
    return []
  }
}

/**
 * Add a course to visited history
 */
export function addVisitedCourse(course: Omit<VisitedCourse, 'visitedAt'>) {
  if (typeof window === 'undefined') return

  try {
    const history = getVisitedCourses()
    // Remove if already exists
    const filtered = history.filter(c => c.id !== course.id)
    // Add to beginning with current timestamp
    const updated = [
      { ...course, visitedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(COURSE_HISTORY_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving visited course:', error)
  }
}

/**
 * Clear visited courses history
 */
export function clearVisitedCourses() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(COURSE_HISTORY_KEY)
}

