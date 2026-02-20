export const ESCOLARIDADE_OPCOES = [
  'Fundamental incompleto',
  'Fundamental completo',
  'Médio incompleto',
  'Médio completo',
  'Médio técnico',
  'Superior técnico',
  'Superior incompleto',
  'Superior completo',
  'Pós graduação / MBA',
  'Mestrado',
  'Doutorado',
] as const

export const STATUS_FORMACAO_OPCOES = [
  'Completo',
  'Em andamento',
  'Incompleto',
] as const

export const TIPO_FORMACAO_OPCOES = [
  'Curso profissionalizante',
  'Curso técnico',
  'Certificado profissional',
  'Graduação',
  'Pós graduação / MBA',
  'Mestrado',
  'Doutorado',
] as const

const START_YEAR = 2015
const END_YEAR = 2026
export const ANO_CONCLUSAO_OPCOES = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => String(START_YEAR + i)
).reverse() // 2026 primeiro

/** Anos de conclusão 2015 a 2025 para formação acadêmica no currículo */
export const ANO_CONCLUSAO_FORMACAO_OPCOES = Array.from(
  { length: 2025 - START_YEAR + 1 },
  (_, i) => String(2025 - i)
) // 2025 primeiro

export const IDIOMAS_OPCOES = [
  'Português',
  'Inglês',
  'Espanhol',
  'Italiano',
  'Alemão',
  'Francês',
] as const

export const NIVEL_IDIOMA_OPCOES = [
  'Básico',
  'Intermediário',
  'Avançado',
  'Nativo/Fluente',
] as const

export const SIM_NAO_OPCOES = ['Sim', 'Não'] as const

export const TIPO_CONQUISTA_OPCOES = [
  'Certificado',
  'Curso',
  'Reconhecimento',
  'Trabalho Voluntário',
] as const

export const SITUACAO_ATUAL_OPCOES = [
  'Buscando primeiro emprego',
  'Empregado(a)',
  'Desempregado(a)',
  'Aposentado',
  'Autônomo',
  'Informal',
  'Profissional liberal',
] as const

/** Opções exibidas no drawer; valor enviado ao backend é o code. */
export const TEMPO_PROCURANDO_EMPREGO_OPCOES = [
  'Há até 6 meses',
  'De 7 a 12 meses',
  'De 13 a 24 meses',
  'Mais de 24 meses',
] as const

/** Códigos estáveis enviados à API (tempo procurando emprego). */
export const TEMPO_PROCURANDO_EMPREGO_CODES = [
  'UP_TO_6',
  'FROM_7_TO_12',
  'FROM_13_TO_24',
  'OVER_24',
] as const

export type TempoProcurandoEmpregoCode =
  (typeof TEMPO_PROCURANDO_EMPREGO_CODES)[number]

/** Mapeamento label (UI) -> code (API). */
export const TEMPO_PROCURANDO_EMPREGO_LABEL_TO_CODE: Record<
  (typeof TEMPO_PROCURANDO_EMPREGO_OPCOES)[number],
  TempoProcurandoEmpregoCode
> = {
  'Há até 6 meses': 'UP_TO_6',
  'De 7 a 12 meses': 'FROM_7_TO_12',
  'De 13 a 24 meses': 'FROM_13_TO_24',
  'Mais de 24 meses': 'OVER_24',
}

/** Mapeamento code (API) -> label (UI). */
export const TEMPO_PROCURANDO_EMPREGO_CODE_TO_LABEL: Record<
  TempoProcurandoEmpregoCode,
  (typeof TEMPO_PROCURANDO_EMPREGO_OPCOES)[number]
> = {
  UP_TO_6: 'Há até 6 meses',
  FROM_7_TO_12: 'De 7 a 12 meses',
  FROM_13_TO_24: 'De 13 a 24 meses',
  OVER_24: 'Mais de 24 meses',
}

/** Para uso no drawer: { label, value: code }. */
export const TEMPO_PROCURANDO_EMPREGO_OPCOES_DISPLAY =
  TEMPO_PROCURANDO_EMPREGO_OPCOES.map(label => ({
    label,
    value: TEMPO_PROCURANDO_EMPREGO_LABEL_TO_CODE[label],
  }))

export const DISPONIBILIDADE_OPCOES = [
  'Imediato',
  'Em até 15 dias',
  'Em até 30 dias',
  'Sem previsão',
] as const

export const TIPO_VINCULO_OPCOES = [
  'CLT',
  'Pessoa Jurídica (PJ)',
  'MEI',
  'Estágio',
  'Aprendiz',
  'Temporário',
  'Autônomo',
] as const
