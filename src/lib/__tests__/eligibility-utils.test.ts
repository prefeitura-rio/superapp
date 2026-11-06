import { describe, expect, it } from 'vitest'
import { checkEligibility } from '../eligibility-utils'

type Params = Parameters<typeof checkEligibility>[0]

const ESCOLARIDADES = [
  { id: 'fund', descricao: 'Ensino Fundamental', ordem: 1 },
  { id: 'medio', descricao: 'Ensino Médio', ordem: 2 },
  { id: 'sup', descricao: 'Ensino Superior', ordem: 3 },
]
const IDIOMAS = [{ id: 'en', descricao: 'Inglês' }]
const NIVEIS = [
  { id: 'basico', descricao: 'Básico', ordem: 1 },
  { id: 'avancado', descricao: 'Avançado', ordem: 2 },
]

const LABEL_ESCOLARIDADE = 'Formação mínima — Ensino Superior'
const LABEL_IDIOMA = 'Idioma Inglês — nível Avançado ou superior'

/** Vaga que exige Ensino Superior e Inglês avançado; candidato não atende nenhum dos dois. */
function params(vagaExtra: Partial<Params['vaga']> = {}): Params {
  return {
    vaga: {
      id_escolaridade_minima: 'sup',
      idiomas_requisito: [{ id_idioma: 'en', id_nivel_minimo: 'avancado' }],
      ...vagaExtra,
    },
    nascimentoData: '1990-01-01',
    formacoesCurriculo: [{ id_escolaridade: 'medio', status: 'Completo' }],
    escolaridadeRmiId: undefined,
    idiomasCurriculo: [{ id_idioma: 'en', id_nivel: 'basico' }],
    escolaridades: ESCOLARIDADES,
    idiomas: IDIOMAS,
    niveisIdioma: NIVEIS,
  }
}

describe('checkEligibility — bloqueio ligado/desligado', () => {
  it('confere formação e idioma com bloqueio ativo e mostra as frases atuais', () => {
    const result = checkEligibility(
      params({ criterios_bloqueio: ['escolaridade', 'idioma'] })
    )
    expect(result.passes).toBe(false)
    expect(result.failedCriterios).toEqual([
      { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
      { slug: 'idioma', label: LABEL_IDIOMA },
    ])
  })

  it('nunca bloqueia quando todos os bloqueios estão desligados ([])', () => {
    const result = checkEligibility(params({ criterios_bloqueio: [] }))
    expect(result).toEqual({ passes: true, failedCriterios: [] })
  })

  it('formação desligada não bloqueia; idioma ligado continua bloqueando', () => {
    const result = checkEligibility(params({ criterios_bloqueio: ['idioma'] }))
    expect(result.passes).toBe(false)
    expect(result.failedCriterios).toEqual([
      { slug: 'idioma', label: LABEL_IDIOMA },
    ])
  })

  it('idioma desligado não bloqueia; formação ligada continua bloqueando', () => {
    const result = checkEligibility(
      params({ criterios_bloqueio: ['escolaridade'] })
    )
    expect(result.passes).toBe(false)
    expect(result.failedCriterios).toEqual([
      { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
    ])
  })

  it('bloqueio desligado não é conferido nem com escolaridade inexistente na referência', () => {
    const result = checkEligibility(
      params({
        id_escolaridade_minima: 'id-que-nao-existe',
        criterios_bloqueio: ['idioma'],
        idiomas_requisito: [],
      })
    )
    expect(result).toEqual({ passes: true, failedCriterios: [] })
  })

  it('bloqueio ativo deixa passar quem atende o critério', () => {
    const result = checkEligibility({
      ...params({ criterios_bloqueio: ['escolaridade', 'idioma'] }),
      formacoesCurriculo: [{ id_escolaridade: 'sup', status: 'Completo' }],
      idiomasCurriculo: [{ id_idioma: 'en', id_nivel: 'avancado' }],
    })
    expect(result).toEqual({ passes: true, failedCriterios: [] })
  })

  it('bloqueio desligado não afeta a idade mínima, que segue conferida', () => {
    const result = checkEligibility({
      ...params({ criterios_bloqueio: [], idade_minima: 200 }),
    })
    expect(result.passes).toBe(false)
    expect(result.failedCriterios).toEqual([
      { slug: 'idade_minima', label: 'Ter pelo menos 200 anos' },
    ])
  })

  it('sem o campo (API anterior à DEV-392) mantém a regra atual e confere tudo que está configurado', () => {
    for (const ausente of [undefined, null]) {
      const result = checkEligibility(params({ criterios_bloqueio: ausente }))
      expect(result.failedCriterios).toEqual([
        { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
        { slug: 'idioma', label: LABEL_IDIOMA },
      ])
    }
  })

  it('ignora chave desconhecida na lista sem ligar outros critérios', () => {
    const result = checkEligibility(params({ criterios_bloqueio: ['pcd'] }))
    expect(result).toEqual({ passes: true, failedCriterios: [] })
  })
})
