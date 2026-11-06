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
    // Valor que a API pode passar a devolver antes de o client ser regenerado: está fora do
    // enum gerado, por isso o cast simula o JSON recebido em runtime.
    const chaveDesconhecida = [
      'altura',
    ] as unknown as Params['vaga']['criterios_bloqueio']
    const result = checkEligibility(
      params({ criterios_bloqueio: chaveDesconhecida })
    )
    expect(result).toEqual({ passes: true, failedCriterios: [] })
  })
})

const FRASE_PCD = 'Ser pessoa com deficiência'
const TIPOS_FAV = [
  { id: 't-fisica', descricao: 'Física' },
  { id: 't-auditiva', descricao: 'Auditiva' },
  { id: 't-visual', descricao: 'Visual' },
]

/** Vaga exclusiva PcD, com bloqueio PcD ligado e nenhum outro critério. */
function paramsPcd(
  vagaExtra: Partial<Params['vaga']>,
  deficiencia: string | null | undefined
): Params {
  return {
    ...params({
      id_escolaridade_minima: undefined,
      idiomas_requisito: [],
      opcao_pcd: 'exclusiva',
      criterios_bloqueio: [
        'pcd',
      ] as unknown as Params['vaga']['criterios_bloqueio'],
      tipos_pcd: [],
      ...vagaExtra,
    }),
    deficiencia,
  }
}

const bloqueios = (...chaves: string[]) =>
  chaves as unknown as Params['vaga']['criterios_bloqueio']

describe('checkEligibility — critério PcD', () => {
  it('bloqueia vaga exclusiva sem tipos quando o cidadão não declarou deficiência', () => {
    for (const semDeficiencia of [
      undefined,
      null,
      '',
      '  ',
      'Nenhuma',
      'Não sou pessoa com deficiência',
      'nao sou pessoa com deficiencia',
    ]) {
      const result = checkEligibility(paramsPcd({}, semDeficiencia))
      expect(result).toEqual({
        passes: false,
        failedCriterios: [{ slug: 'pcd', label: FRASE_PCD }],
      })
    }
  })

  it('deixa passar vaga exclusiva sem tipos quando o cidadão declarou qualquer deficiência', () => {
    for (const deficiencia of [
      'Física',
      'Intelectual',
      'Reabilitado do INSS',
    ]) {
      expect(checkEligibility(paramsPcd({}, deficiencia))).toEqual({
        passes: true,
        failedCriterios: [],
      })
    }
  })

  it('com tipos na vaga, bloqueia quem declarou deficiência fora deles e lista os tipos na frase', () => {
    const result = checkEligibility(
      paramsPcd({ tipos_pcd: TIPOS_FAV }, 'Intelectual')
    )
    expect(result).toEqual({
      passes: false,
      failedCriterios: [
        {
          slug: 'pcd',
          label: 'Ser pessoa com deficiência (Física, Auditiva ou Visual)',
        },
      ],
    })
  })

  it('com tipos na vaga, bloqueia quem não declarou deficiência com a frase dos tipos', () => {
    const result = checkEligibility(
      paramsPcd({ tipos_pcd: TIPOS_FAV }, 'Não sou pessoa com deficiência')
    )
    expect(result.failedCriterios).toEqual([
      {
        slug: 'pcd',
        label: 'Ser pessoa com deficiência (Física, Auditiva ou Visual)',
      },
    ])
  })

  it('com tipos na vaga, deixa passar quem tem um tipo em comum, sem diferenciar caixa nem acento', () => {
    for (const deficiencia of ['Auditiva', 'visual', ' FISICA ']) {
      expect(
        checkEligibility(paramsPcd({ tipos_pcd: TIPOS_FAV }, deficiencia))
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('monta a frase com um e com dois tipos', () => {
    expect(
      checkEligibility(paramsPcd({ tipos_pcd: [TIPOS_FAV[0]] }, 'Visual'))
        .failedCriterios[0].label
    ).toBe('Ser pessoa com deficiência (Física)')
    expect(
      checkEligibility(
        paramsPcd({ tipos_pcd: TIPOS_FAV.slice(0, 2) }, 'Visual')
      ).failedCriterios[0].label
    ).toBe('Ser pessoa com deficiência (Física ou Auditiva)')
  })

  it('não confere vaga aberta nem preferencial, mesmo com o bloqueio ligado', () => {
    for (const opcao of ['aberta', 'preferencial']) {
      expect(
        checkEligibility(
          paramsPcd({ opcao_pcd: opcao, tipos_pcd: TIPOS_FAV }, undefined)
        )
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('não confere vaga exclusiva com o bloqueio PcD desligado ou sem a lista de bloqueios', () => {
    for (const criterios of [
      bloqueios(),
      bloqueios('escolaridade', 'idioma'),
      undefined,
      null,
    ]) {
      expect(
        checkEligibility(
          paramsPcd({ criterios_bloqueio: criterios }, undefined)
        )
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('sem opcao_pcd (API anterior ao campo), usa acessibilidade_pcd exclusivo_pcd', () => {
    const result = checkEligibility(
      paramsPcd(
        { opcao_pcd: undefined, acessibilidade_pcd: 'exclusivo_pcd' },
        'Nenhuma'
      )
    )
    expect(result.failedCriterios).toEqual([{ slug: 'pcd', label: FRASE_PCD }])
    expect(
      checkEligibility(
        paramsPcd(
          { opcao_pcd: undefined, acessibilidade_pcd: 'preferencial_pcd' },
          'Nenhuma'
        )
      ).passes
    ).toBe(true)
  })

  it('opcao_pcd prevalece sobre acessibilidade_pcd', () => {
    expect(
      checkEligibility(
        paramsPcd(
          { opcao_pcd: 'aberta', acessibilidade_pcd: 'exclusivo_pcd' },
          undefined
        )
      ).passes
    ).toBe(true)
  })

  it('soma o critério PcD aos demais bloqueios ligados, como primeiro item (ordem do Admin)', () => {
    const result = checkEligibility({
      ...params({
        idade_minima: 200,
        criterios_bloqueio: bloqueios('escolaridade', 'idioma', 'pcd'),
        opcao_pcd: 'exclusiva',
        tipos_pcd: TIPOS_FAV,
      }),
      deficiencia: 'Nenhuma',
    })
    expect(result.failedCriterios).toEqual([
      {
        slug: 'pcd',
        label: 'Ser pessoa com deficiência (Física, Auditiva ou Visual)',
      },
      { slug: 'idade_minima', label: 'Ter pelo menos 200 anos' },
      { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
      { slug: 'idioma', label: LABEL_IDIOMA },
    ])
  })
})

/** Catálogo de tipos PcD do Admin (`GET /api/v1/empregabilidade/tipos-pcd`). */
const CATALOGO_PCD = [
  { id: 't-fisica', descricao: 'Física' },
  { id: 't-auditiva', descricao: 'Auditiva' },
  { id: 't-intelectual', descricao: 'Intelectual' },
  { id: 't-multipla', descricao: 'Múltipla' },
  { id: 't-visual', descricao: 'Visual' },
]

describe('checkEligibility — PcD "Todos os tipos"', () => {
  /** Vaga com todos os tipos do catálogo, como o Admin grava ao marcar "Todos os tipos". */
  const todosOsTipos = (
    deficiencia: string | null | undefined,
    vagaExtra: Partial<Params['vaga']> = {}
  ): Params => ({
    ...paramsPcd({ tipos_pcd: [...CATALOGO_PCD], ...vagaExtra }, deficiencia),
    tiposPcdCatalogo: CATALOGO_PCD,
  })

  it('deixa passar quem declarou qualquer deficiência, mesmo fora dos nomes do catálogo', () => {
    for (const deficiencia of [
      'Física',
      'Reabilitado do INSS',
      'Transtorno do espectro autista',
    ]) {
      expect(checkEligibility(todosOsTipos(deficiencia))).toEqual({
        passes: true,
        failedCriterios: [],
      })
    }
  })

  it('bloqueia quem não declarou deficiência com a frase sem parênteses', () => {
    for (const semDeficiencia of [
      undefined,
      'Nenhuma',
      'Não sou pessoa com deficiência',
    ]) {
      expect(checkEligibility(todosOsTipos(semDeficiencia))).toEqual({
        passes: false,
        failedCriterios: [{ slug: 'pcd', label: FRASE_PCD }],
      })
    }
  })

  it('vale qualquer que seja a ordem dos tipos gravados na vaga', () => {
    const result = checkEligibility(
      todosOsTipos('Reabilitado do INSS', {
        tipos_pcd: [...CATALOGO_PCD].reverse(),
      })
    )
    expect(result.passes).toBe(true)
  })

  it('com só parte do catálogo na vaga, continua exigindo um dos tipos e listando-os', () => {
    const result = checkEligibility({
      ...paramsPcd(
        { tipos_pcd: CATALOGO_PCD.slice(0, 4) },
        'Reabilitado do INSS'
      ),
      tiposPcdCatalogo: CATALOGO_PCD,
    })
    expect(result).toEqual({
      passes: false,
      failedCriterios: [
        {
          slug: 'pcd',
          label:
            'Ser pessoa com deficiência (Física, Auditiva, Intelectual ou Múltipla)',
        },
      ],
    })
  })

  it('sem o catálogo (falha ao buscar), mantém a regra por tipo', () => {
    for (const catalogo of [undefined, []]) {
      const result = checkEligibility({
        ...paramsPcd({ tipos_pcd: [...CATALOGO_PCD] }, 'Reabilitado do INSS'),
        tiposPcdCatalogo: catalogo,
      })
      expect(result.passes).toBe(false)
      expect(result.failedCriterios[0].label).toBe(
        'Ser pessoa com deficiência (Física, Auditiva, Intelectual, Múltipla ou Visual)'
      )
    }
  })
})
