export interface CertificateData {
  studentName: string
  courseTitle: string
  courseDuration: string
  issuingOrganization: string
  issueDate: string
}

export interface CertificateGenerationOptions {
  fileName?: string
  download?: boolean
}

export interface CertificateTemplate {
  id: string
  name: string
  templateUrl: string
}
