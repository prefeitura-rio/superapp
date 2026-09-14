import { type Page, expect, test } from '@playwright/test'
import {
  applyE2EAuthCookies,
  applyE2ECookieConsent,
  hasE2EAuth,
} from './fixtures/auth'

// ---------------------------------------------------------------------------
// VIGÊNCIA DE INSCRIÇÃO POR TURMA — PÚBLICO
// ---------------------------------------------------------------------------

/**
 * A UI oferecia inscrição em turma fora do período de vigência porque só olhava
 * as vagas restantes. A janela do curso é a união [abertura mais cedo,
 * encerramento mais tarde] entre as turmas, então continua aberta em intervalos
 * onde nenhuma turma aceita ninguém.
 *
 * Estes testes não fixam IDs: consultam a API pública, classificam os cursos
 * pela mesma regra do app e conferem se a página bate. Quando o ambiente não
 * tem curso no estado necessário, o teste faz skip com o motivo.
 */

type ApiSchedule = {
  enrollment_start_date?: string | null
  enrollment_end_date?: string | null
  accepting_enrollments?: boolean | null
  remaining_vacancies?: number | null
}

type ApiCourse = {
  id: number
  title?: string
  status?: string
  is_visible?: boolean
  external_partner_url?: string | null
  locations?: { schedules?: ApiSchedule[] }[] | null
  remote_class?: { schedules?: ApiSchedule[] } | null
}

const LISTING_STATUSES = new Set([
  'opened',
  'published',
  'scheduled',
  'accepting_enrollments',
  'in_progress',
])

function coursesApiBaseUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_COURSES_BASE_API_URL ??
    process.env.COURSES_BASE_API_URL ??
    null
  )
}

function courseSchedules(course: ApiCourse): ApiSchedule[] {
  const schedules: ApiSchedule[] = []
  for (const location of course.locations ?? []) {
    schedules.push(...(location?.schedules ?? []))
  }
  schedules.push(...(course.remote_class?.schedules ?? []))
  return schedules
}

/** Mesma regra de getScheduleAvailability: janela aberta E vaga restante. */
function isScheduleSelectable(schedule: ApiSchedule, now: number): boolean {
  if (schedule.accepting_enrollments === false) return false
  const start = schedule.enrollment_start_date
    ? Date.parse(schedule.enrollment_start_date)
    : null
  if (start !== null && !Number.isNaN(start) && now < start) return false
  const end = schedule.enrollment_end_date
    ? Date.parse(schedule.enrollment_end_date)
    : null
  if (end !== null && !Number.isNaN(end) && now > end) return false
  const remaining = schedule.remaining_vacancies
  return remaining != null && remaining > 0
}

async function fetchCourses(page: Page): Promise<ApiCourse[]> {
  const base = coursesApiBaseUrl()
  if (!base) return []

  const collected: ApiCourse[] = []
  for (const pageNumber of [1, 2, 3]) {
    const res = await page.request
      .get(`${base}/api/public/courses?page=${pageNumber}&limit=100`, {
        timeout: 30000,
      })
      .catch(() => null)
    if (!res?.ok()) break
    const body = (await res.json().catch(() => null)) as {
      data?: { courses?: ApiCourse[] }
    } | null
    const courses = body?.data?.courses ?? []
    if (courses.length === 0) break
    collected.push(...courses)
  }
  return collected
}

const enrollmentCtaLocator = (page: Page) =>
  page.locator('a[href^="/servicos/cursos/confirmar-informacoes/"]')

test.describe('Cursos — vigência de inscrição por turma (público)', () => {
  test.beforeEach(async ({ context }) => {
    await applyE2ECookieConsent(context)
  })

  test('curso sem nenhuma turma inscritível não oferece link de inscrição', async ({
    page,
  }) => {
    test.setTimeout(120000)

    const base = coursesApiBaseUrl()
    if (!base) {
      test.skip(true, 'COURSES_BASE_API_URL não configurada no ambiente')
      return
    }

    const now = Date.now()
    const courses = await fetchCourses(page)
    // Só cursos que a home renderiza e que têm turmas, mas nenhuma inscritível
    const target = courses.find(course => {
      if (!LISTING_STATUSES.has(String(course.status))) return false
      if (course.is_visible === false) return false
      const schedules = courseSchedules(course)
      if (schedules.length === 0) return false
      return !schedules.some(schedule => isScheduleSelectable(schedule, now))
    })

    if (!target) {
      test.skip(
        true,
        'Ambiente não tem curso listado cujas turmas estejam todas fora da vigência ou sem vaga'
      )
      return
    }

    await page.goto(`/servicos/cursos/${target.id}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    // O CTA de inscrição não pode existir: seguir por ele levaria a uma recusa
    // garantida da API no último passo do fluxo.
    await expect(enrollmentCtaLocator(page)).toHaveCount(0)

    // E o botão precisa estar visível e desabilitado, explicando o porquê
    const disabledCta = page.locator('main button[disabled]').first()
    await expect(disabledCta).toBeVisible({ timeout: 15000 })
    await expect(disabledCta).toHaveText(
      /Inscrições encerradas|Vagas encerradas|Disponível em breve|Curso não está mais disponível/
    )
  })

  test('curso com turma dentro da vigência mantém o link de inscrição', async ({
    page,
  }) => {
    test.setTimeout(120000)

    const base = coursesApiBaseUrl()
    if (!base) {
      test.skip(true, 'COURSES_BASE_API_URL não configurada no ambiente')
      return
    }

    const now = Date.now()
    const courses = await fetchCourses(page)
    // Parceiro externo abre drawer em vez de link — fora do escopo desta asserção
    const target = courses.find(course => {
      if (!LISTING_STATUSES.has(String(course.status))) return false
      if (course.is_visible === false) return false
      if (course.external_partner_url) return false
      return courseSchedules(course).some(schedule =>
        isScheduleSelectable(schedule, now)
      )
    })

    if (!target) {
      test.skip(
        true,
        'Ambiente não tem curso listado com turma dentro da vigência e com vaga'
      )
      return
    }

    await page.goto(`/servicos/cursos/${target.id}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })

    await expect(enrollmentCtaLocator(page).first()).toBeVisible({
      timeout: 15000,
    })
  })

  test('acesso direto ao fluxo de inscrição de curso indisponível volta para a página do curso', async ({
    page,
    context,
  }) => {
    test.setTimeout(120000)

    if (!hasE2EAuth()) {
      test.skip(true, 'Sem credenciais E2E; o fluxo exige sessão autenticada')
      return
    }
    await applyE2EAuthCookies(context)

    const base = coursesApiBaseUrl()
    if (!base) {
      test.skip(true, 'COURSES_BASE_API_URL não configurada no ambiente')
      return
    }

    const now = Date.now()
    const courses = await fetchCourses(page)
    const target = courses.find(course => {
      if (!LISTING_STATUSES.has(String(course.status))) return false
      const schedules = courseSchedules(course)
      if (schedules.length === 0) return false
      return !schedules.some(schedule => isScheduleSelectable(schedule, now))
    })

    if (!target) {
      test.skip(
        true,
        'Ambiente não tem curso com todas as turmas fora da vigência ou sem vaga'
      )
      return
    }

    // Colar a URL do fluxo era o caminho que escapava do botão desabilitado
    await page.goto(`/servicos/cursos/confirmar-informacoes/${target.id}`)
    await page.waitForURL(`**/servicos/cursos/${target.id}`, { timeout: 20000 })
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
  })
})
