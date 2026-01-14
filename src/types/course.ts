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
  schedules?: Schedule[]
}

export interface Schedule {
  id: string
  location_id?: string
  vacancies: number
  remaining_vacancies?: number
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
  schedules: Schedule[]
  created_at: string
  updated_at: string
}

export type AccessibilityTypes = 'ACESSIVEL' | 'EXCLUSIVO' | 'NAO_ACESSIVEL'
export const ACCESSIBILITY_OPTIONS: AccessibilityTypes[] = [
  'ACESSIVEL',
  'EXCLUSIVO',
  'NAO_ACESSIVEL',
] as const
export const accessibilityLabel: Record<AccessibilityTypes, string> = {
  ACESSIVEL: 'Acessível PcD',
  EXCLUSIVO: 'Exclusivo PcD',
  NAO_ACESSIVEL: 'Não acessível PcD',
}

export type AccessibilityProps = AccessibilityTypes | undefined | ''

export type CourseManagementType =
  | 'OWN_ORG'
  | 'EXTERNAL_MANAGED_BY_ORG'
  | 'EXTERNAL_MANAGED_BY_PARTNER'

export interface Course {
  id: number
  title: string
  description: string
  enrollment_start_date: string
  enrollment_end_date: string
  organization: string
  orgao_id?: string
  modalidade: string
  theme: string
  workload: string
  target_audience: string
  institutional_logo: string
  cover_image: string
  status: string
  has_certificate: boolean
  accessibility?: AccessibilityTypes | undefined | ''
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
  /** @deprecated Use course_management_type instead */
  is_external_partner?: boolean
  course_management_type?: CourseManagementType
  external_partner_name?: string
  external_partner_url?: string
  external_partner_logo_url?: string
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

/**
 * Determines if the external partner badge should be shown
 * Badge is shown for EXTERNAL_MANAGED_BY_PARTNER and EXTERNAL_MANAGED_BY_ORG
 */
export function shouldShowExternalPartnerBadge(
  courseManagementType?: CourseManagementType
): boolean {
  return (
    courseManagementType === 'EXTERNAL_MANAGED_BY_PARTNER' ||
    courseManagementType === 'EXTERNAL_MANAGED_BY_ORG'
  )
}

/**
 * Determines if the external partner redirect modal should be shown
 * Modal is only shown for EXTERNAL_MANAGED_BY_PARTNER
 */
export function shouldShowExternalPartnerModal(
  courseManagementType?: CourseManagementType
): boolean {
  return courseManagementType === 'EXTERNAL_MANAGED_BY_PARTNER'
}
