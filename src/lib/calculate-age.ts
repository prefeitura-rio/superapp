/** Fuso do dia civil em que a idade é conferida. */
const AGE_TIME_ZONE = 'America/Sao_Paulo'

/** `YYYY-MM-DD` no início da data de nascimento, sozinho ou seguido do horário ISO. */
const BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/

interface CivilDate {
  year: number
  /** 1 a 12. */
  month: number
  day: number
}

/**
 * Ano, mês e dia da data de nascimento, sem conversão de fuso: `2008-06-16T00:00:00Z` é 16/06
 * em qualquer servidor ou navegador. `null` quando não começa por uma data de calendário válida.
 */
function parseBirthCivilDate(birthDate: string): CivilDate | null {
  const match = BIRTH_DATE_PATTERN.exec(birthDate)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return { year, month, day }
}

/** Dia civil de hoje em `AGE_TIME_ZONE`, independente do fuso do processo. */
function todayInAgeTimeZone(): CivilDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: AGE_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find(p => p.type === type)?.value)
  return { year: part('year'), month: part('month'), day: part('day') }
}

/**
 * Calcula a idade completa no dia civil de hoje em Brasília (`America/Sao_Paulo`), comparando só
 * ano, mês e dia da data de nascimento: o resultado é o mesmo em qualquer fuso do servidor ou do
 * navegador.
 * @param birthDate - Data no formato YYYY-MM-DD ou ISO (só a parte da data é considerada)
 * @returns Idade em anos, ou null se a data for ausente ou inválida
 */
export function calculateAge(
  birthDate: string | undefined | null
): number | null {
  if (!birthDate) {
    return null
  }

  const birth = parseBirthCivilDate(birthDate)
  if (birth == null) {
    return null
  }

  const today = todayInAgeTimeZone()
  let age = today.year - birth.year

  // Ainda não fez aniversário neste ano
  if (
    today.month < birth.month ||
    (today.month === birth.month && today.day < birth.day)
  ) {
    age--
  }

  return age
}
