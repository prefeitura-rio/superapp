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

// Datas absolutas e distantes: os testes que as usam não precisam de fake
// timers e não expiram com o tempo.
const ENROLLMENT_OPEN = {
  enrollment_start_date: '2020-01-01T00:00:00Z',
  enrollment_end_date: '2099-12-31T23:59:59Z',
}
const ENROLLMENT_CLOSED = {
  enrollment_start_date: '2020-01-01T00:00:00Z',
  enrollment_end_date: '2021-01-01T00:00:00Z',
}
const ENROLLMENT_NOT_STARTED = {
  enrollment_start_date: '2098-01-01T00:00:00Z',
  enrollment_end_date: '2099-12-31T23:59:59Z',
}

function makeSchedule(overrides: Partial<Schedule> & { id: string }): Schedule {
  return { ...baseSchedule, remaining_vacancies: 5, ...overrides }
}

/**
 * Reproduz o curso 2865 da homologação: a janela do curso (união das turmas)
 * está aberta, mas nenhuma unidade aceita inscrição agora — uma perdeu o prazo
 * mesmo tendo vaga, outra está no prazo mas sem vaga, outra ainda vai abrir.
 */
export const nearbyUnitsMixedWindows: NearbyUnit[] = [
  {
    id: 'unit-open',
    curso_id: 123,
    address: 'Rua Aberta, 1',
    neighborhood: 'Centro',
    schedules: [
      makeSchedule({
        id: 'sched-open',
        location_id: 'unit-open',
        ...ENROLLMENT_OPEN,
      }),
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'unit-closed',
    curso_id: 123,
    address: 'Rua Encerrada, 2',
    neighborhood: 'Tijuca',
    schedules: [
      makeSchedule({
        id: 'sched-closed',
        location_id: 'unit-closed',
        ...ENROLLMENT_CLOSED,
      }),
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'unit-no-vacancies',
    curso_id: 123,
    address: 'Rua Sem Vaga, 3',
    neighborhood: 'Méier',
    schedules: [
      makeSchedule({
        id: 'sched-no-vacancies',
        location_id: 'unit-no-vacancies',
        remaining_vacancies: 0,
        ...ENROLLMENT_OPEN,
      }),
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'unit-not-started',
    curso_id: 123,
    address: 'Rua Futura, 4',
    neighborhood: 'Bangu',
    schedules: [
      makeSchedule({
        id: 'sched-not-started',
        location_id: 'unit-not-started',
        ...ENROLLMENT_NOT_STARTED,
      }),
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

/** Uma unidade com duas turmas: uma no prazo, outra encerrada mas com vaga. */
export const unitWithClosedAndOpenSchedules: NearbyUnit[] = [
  {
    id: 'unit-two-schedules',
    curso_id: 123,
    address: 'Rua Principal, 100',
    neighborhood: 'Centro',
    schedules: [
      makeSchedule({
        id: 'sched-two-open',
        location_id: 'unit-two-schedules',
        ...ENROLLMENT_OPEN,
      }),
      makeSchedule({
        id: 'sched-two-closed',
        location_id: 'unit-two-schedules',
        ...ENROLLMENT_CLOSED,
      }),
    ],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

/** Turmas online: uma aceitando, outra com vaga porém fora do prazo. */
export const onlineClassesMixedWindows: Schedule[] = [
  makeSchedule({ id: 'online-open', ...ENROLLMENT_OPEN }),
  makeSchedule({ id: 'online-closed', ...ENROLLMENT_CLOSED }),
]
