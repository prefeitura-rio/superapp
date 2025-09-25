export interface CourseSearchPageProps {
  id: string
  title: string
  status: string
  date: string
  provider: string
  workload: string
  modality: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
  spots?: number
  description?: string
  requirements?: string[]
  imageUrl?: string
}

interface RemoteClass {
  id: string
  curso_id: number
  vacancies: number
  class_start_date: string
  class_end_date: string
  class_time: string
  class_days: string
  created_at: string
  updated_at: string
}

interface Location {
  id: string
  curso_id: number
  address: string
  neighborhood: string
  vacancies: number
  class_start_date: string
  class_end_date: string
  class_time: string
  class_days: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: number
  title: string
  description: string
  enrollment_start_date: string
  enrollment_end_date: string
  organization: string
  modalidade: string
  theme: string
  workload: string
  target_audience: string
  institutional_logo: string
  cover_image: string
  status: string
  has_certificate: boolean
  pre_requisitos?: string
  facilitator?: string
  objectives?: string
  expected_results?: string
  program_content?: string
  methodology?: string
  resources_used?: string
  material_used?: string
  teaching_material?: string
  remote_class?: RemoteClass | null
  locations?: Location[]
  is_external_partner?: boolean
  external_partner_name?: string
  external_partner_url?: string
}

export interface UserEnrollment {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'concluded'
  course_id: number
  certificate_url?: string
}

export interface CourseScheduleInfo {
  startDate: string | null
  endDate: string | null
  time: string | null
  days: string | null
  vacancies: number | null
  address: string | null
  neighborhood: string | null
}
