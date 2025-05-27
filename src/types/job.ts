export interface Job {
  id: number
  title: string
  status: string
  provider: string
  modality: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
  salary: number
  publishedAt: string
  spots?: number
  description?: string
  requirements?: string[]
}
