import type { NearbyUnit, Schedule } from '../../../types'

const baseSchedule: Schedule = {
  id: 'schedule-1',
  location_id: 'unit-1',
  vacancies: 30,
  class_start_date: '2026-02-01',
  class_end_date: '2026-06-30',
  class_time: '19:00 - 21:00',
  class_days: 'Segunda e Quarta',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const nearbyUnitsSingle: NearbyUnit[] = [
  {
    id: 'unit-1',
    curso_id: 123,
    address: 'Rua Principal, 100',
    neighborhood: 'Centro',
    schedules: [baseSchedule],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const emptyUnits: NearbyUnit[] = []

export const onlineClassesSingle: Schedule[] = [
  {
    id: 'online-class-1',
    vacancies: 100,
    class_start_date: '2026-02-01',
    class_end_date: '2026-06-30',
    class_time: '19:00 - 21:00',
    class_days: 'Segunda a Sexta',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]
