import type { CustomField } from '../../../types'

export const basicCourseInfo = {
  data: {
    id: 123,
    title: 'Curso de Programação Web',
    description: 'Aprenda programação web do zero ao avançado',
    category: 'Tecnologia',
    duration: '120 horas',
    modality: 'presencial',
    custom_fields: [] as CustomField[],
  },
}

export const courseId = '123'
export const courseSlug = 'curso-programacao-web'
