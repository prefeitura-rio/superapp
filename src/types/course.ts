export interface Course {
  id: number
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
  imageUrl: string
  requirements?: string[]
}
