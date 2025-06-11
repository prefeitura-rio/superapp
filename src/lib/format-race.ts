const RACE_DISPLAY_MAP: { [key: string]: string } = {
  branca: 'Branca',
  preta: 'Preta',
  parda: 'Parda',
  amarela: 'Amarela',
  indigena: 'Indígena',
  outra: 'Outra',
}

export function formatRace(apiRaceValue: string | undefined | null): string {
  if (!apiRaceValue) {
    return '' // Or a default value like 'Não informado'
  }
  return RACE_DISPLAY_MAP[apiRaceValue.toLowerCase()] || apiRaceValue
}
