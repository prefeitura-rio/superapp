export interface CertificateData {
  studentName: string
  courseTitle: string
  courseDuration: string
  issuingOrganization: string
  issueDate: string
  orgao_id?: string // ID do órgão para buscar o nome e selecionar o template
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
