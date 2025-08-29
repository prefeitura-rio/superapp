'use server'

import { getApiV1CoursesCourseIdEnrollments } from '@/http-courses/inscricoes/inscricoes'
import { getUserInfoFromToken } from '@/lib/user-info'

export async function getUserEnrollment(courseId: number) {
  try {
    const currentUser = await getUserInfoFromToken()
    
    if (!currentUser?.cpf) {
      console.log('No user CPF found')
      return null
    }

    console.log('Fetching enrollment for user:', currentUser.cpf, 'course:', courseId)

    const response = await getApiV1CoursesCourseIdEnrollments(courseId, {
      search: currentUser.cpf,
      limit: 1
    })

    console.log('API Response status:', response.status)

    if (response.status === 200 && response.data) {
      // Based on the console output, the structure is:
      // response.data.data.enrollments[]
      const responseData = response.data as any
      if (responseData.data && responseData.data.enrollments && Array.isArray(responseData.data.enrollments)) {
        const enrollments = responseData.data.enrollments
        
        if (enrollments.length > 0) {
          // Find the enrollment for the current user
          const userEnrollment = enrollments.find(
            (enrollment: any) => enrollment.cpf === currentUser.cpf
          )
          
          if (userEnrollment) {
            console.log('Found user enrollment:', userEnrollment.id, 'status:', userEnrollment.status)
            return userEnrollment
          } else {
            console.log('No matching enrollment found for user CPF')
            return null
          }
        } else {
          console.log('No enrollments found in response')
          return null
        }
      } else {
        console.log('Unexpected response structure:', response.data)
        return null
      }
    } else {
      console.log('Response not successful or no data:', response.status, response.data)
      return null
    }
  } catch (error) {
    console.error('Error fetching user enrollment:', error)
    return null
  }
}
