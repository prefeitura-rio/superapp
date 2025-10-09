# Course Filtering and Enrollment Status Logic

This document explains the course filtering and enrollment status logic implemented in the citizen portal.

## Overview

The system implements a comprehensive filtering mechanism for courses based on their status and various date conditions. This ensures users only see relevant courses and provides appropriate enrollment options.

## Course Visibility Rules

### 1. Status-Based Filtering
- **Only courses with status "opened" are shown**
- Courses with status "closed", "canceled", or any other status are hidden

### 2. Class End Date Logic
The system handles both online and in-person courses:

#### Online Courses (`remote_class`)
- Uses `remote_class.class_end_date` for end date checking

#### In-Person/Semi-In-Person Courses (`locations`)
- Checks all `locations[].class_end_date` values
- Uses the **latest** class end date among all locations
- If at least one location is still ongoing, the course is considered active

#### 30-Day Rule
- If a course has ended (latest class end date is in the past), it's still shown for **30 days** after the end date
- After 30 days, the course is automatically hidden from the course list
- This allows users to see recently ended courses but prevents cluttering the list with old courses

## Enrollment Status Logic

The enrollment status determines what button is shown and whether enrollment is possible. **Important**: Class end date takes priority over enrollment end date.

### 1. Coming Soon (`coming_soon`)
- **Condition**: `enrollment_start_date` is in the future
- **Button Text**: "Disponível em breve"
- **Button State**: Disabled
- **Can Enroll**: No

### 2. Course Ended (`course_ended`) ⭐ **HIGHEST PRIORITY**
- **Condition**: Latest class end date is in the past (but within 30 days)
- **Button Text**: "Curso encerrado"
- **Button State**: Disabled
- **Can Enroll**: No
- **Note**: This status takes precedence over enrollment end date

### 3. Enrollment Closed (`enrollment_closed`)
- **Condition**: `enrollment_end_date` is in the past (only checked if class hasn't ended)
- **Button Text**: "Inscrições encerradas"
- **Button State**: Disabled
- **Can Enroll**: No

### 4. Available (`available`)
- **Condition**: All dates are valid and course is open for enrollment
- **Button Text**: "Inscreva-se"
- **Button State**: Enabled
- **Can Enroll**: Yes

## Implementation

### Utility Functions

The logic is implemented in `src/lib/course-utils.ts`:

- `shouldShowCourse(course)`: Determines if a course should be visible
- `getCourseEnrollmentInfo(course)`: Returns enrollment status and button configuration
- `filterVisibleCourses(courses)`: Filters an array of courses to show only visible ones
- `getLatestClassEndDate(course)`: Gets the latest class end date from either `remote_class` or `locations`

### Usage Examples

```typescript
import { filterVisibleCourses, getCourseEnrollmentInfo } from '@/lib/course-utils'

// Filter courses for display
const visibleCourses = filterVisibleCourses(allCourses)

// Get enrollment info for a specific course
const enrollmentInfo = getCourseEnrollmentInfo(course)
console.log(enrollmentInfo.buttonText) // "Inscreva-se", "Disponível em breve", etc.
```

## Date Fields

The system uses the following date fields from the course model:

- `enrollment_start_date`: When enrollment opens
- `enrollment_end_date`: When enrollment closes
- `remote_class.class_end_date`: When the online course ends
- `locations[].class_end_date`: When each in-person location ends
- `status`: Course status ("opened", "closed", "canceled")

## Testing Scenarios

### Scenario 1: Future Enrollment
- Course status: "opened"
- enrollment_start_date: "2024-12-01" (future)
- Result: Course shown, button "Disponível em breve" (disabled)

### Scenario 2: Course Ended (Takes Priority)
- Course status: "opened"
- enrollment_end_date: "2024-01-01" (past)
- class_end_date: "2024-01-15" (past, but within 30 days)
- Result: Course shown, button "Curso encerrado" (disabled) ⭐ **Priority over enrollment**

### Scenario 3: Enrollment Closed (Only if class hasn't ended)
- Course status: "opened"
- enrollment_end_date: "2024-01-01" (past)
- class_end_date: "2024-12-31" (future)
- Result: Course shown, button "Inscrições encerradas" (disabled)

### Scenario 4: In-Person Course with Multiple Locations
- Course status: "opened"
- locations[0].class_end_date: "2024-01-10" (past)
- locations[1].class_end_date: "2024-01-20" (future)
- Result: Course shown, button "Inscreva-se" (enabled) - because at least one location is still active

### Scenario 5: All Locations Ended (Within 30 Days)
- Course status: "opened"
- locations[0].class_end_date: "2024-01-10" (past)
- locations[1].class_end_date: "2024-01-15" (past, but within 30 days)
- Result: Course shown, button "Curso encerrado" (disabled)

### Scenario 6: Course Ended (After 30 Days)
- Course status: "opened"
- Latest class_end_date: "2024-01-01" (past, more than 30 days ago)
- Result: Course hidden from list

### Scenario 7: Available for Enrollment
- Course status: "opened"
- All dates are valid
- Result: Course shown, button "Inscreva-se" (enabled)

### Scenario 8: Closed Course
- Course status: "closed"
- Result: Course hidden from list regardless of dates
