import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const FRASE_QUALQUER_TEMPO = 'Ter experiência em carteira assinada'
const FRASE_6_MESES = 'Ter pelo menos 6 meses de experiência em carteira'

type Experiencias = NonNullable<Params['experienciasCurriculo']>

/** Vaga só com o critério de experiência em carteira, com o bloqueio ligado. */
function paramsCarteira(
  experienciaCarteira: string | null | undefined,
  experienciasCurriculo: Experiencias | undefined,
  vagaExtra: Partial<Params['vaga']> = {}
): Params {
  return {
    ...params({
      id_escolaridade_minima: undefined,
      idiomas_requisito: [],
      experiencia_carteira: experienciaCarteira,
      criterios_bloqueio: bloqueios('experiencia_carteira'),
      ...vagaExtra,
    }),
    experienciasCurriculo,
  }
}

const emCarteira = (meses?: number | null) => ({
  experiencia_comprovada_ct: true,
  tempo_experiencia_meses: meses,
})
const semCarteira = (meses?: number | null) => ({
  experiencia_comprovada_ct: false,
  tempo_experiencia_meses: meses,
})

describe('checkEligibility — critério experiência em carteira', () => {
  it('qualquer tempo: bloqueia sem nenhuma experiência em carteira, com a frase da opção', () => {
    for (const experiencias of [
      undefined,
      [],
      [semCarteira(48)],
      [{ tempo_experiencia_meses: 12 }],
      [{ experiencia_comprovada_ct: null, tempo_experiencia_meses: 12 }],
    ]) {
      expect(
        checkEligibility(paramsCarteira('qualquer_tempo', experiencias))
      ).toEqual({
        passes: false,
        failedCriterios: [
          { slug: 'experiencia_carteira', label: FRASE_QUALQUER_TEMPO },
        ],
      })
    }
  })

  it('qualquer tempo: deixa passar com uma experiência em carteira, de qualquer duração', () => {
    for (const experiencias of [
      [emCarteira(1)],
      [emCarteira(0)],
      [emCarteira(undefined)],
      [semCarteira(3), emCarteira(null)],
    ]) {
      expect(
        checkEligibility(paramsCarteira('qualquer_tempo', experiencias))
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('mínimo de 6 meses: soma todas as experiências em carteira do currículo', () => {
    for (const experiencias of [
      [emCarteira(6)],
      [emCarteira(2), emCarteira(4)],
      [emCarteira(1), emCarteira(1), emCarteira(1), emCarteira(3)],
      [emCarteira(3), semCarteira(10), emCarteira(3)],
      [emCarteira(30)],
    ]) {
      expect(
        checkEligibility(paramsCarteira('minimo_6_meses', experiencias))
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('mínimo de 6 meses: bloqueia quando a soma em carteira não chega a 6, com a frase da opção', () => {
    for (const experiencias of [
      undefined,
      [],
      [emCarteira(5)],
      [emCarteira(2), emCarteira(3)],
      [emCarteira(3), semCarteira(24)],
      [emCarteira(undefined), emCarteira(null), emCarteira(5)],
      [emCarteira(-10), emCarteira(5)],
      [emCarteira(Number.NaN), emCarteira(5)],
    ]) {
      expect(
        checkEligibility(paramsCarteira('minimo_6_meses', experiencias))
      ).toEqual({
        passes: false,
        failedCriterios: [
          { slug: 'experiencia_carteira', label: FRASE_6_MESES },
        ],
      })
    }
  })

  it('tempo negativo não desconta das demais experiências em carteira', () => {
    expect(
      checkEligibility(
        paramsCarteira('minimo_6_meses', [emCarteira(-10), emCarteira(6)])
      ).passes
    ).toBe(true)
  })

  it('com o bloqueio desligado, não confere a experiência em carteira', () => {
    for (const criterios of [
      bloqueios(),
      bloqueios('escolaridade', 'idioma', 'pcd'),
      undefined,
      null,
    ]) {
      expect(
        checkEligibility(
          paramsCarteira('minimo_6_meses', [], {
            criterios_bloqueio: criterios,
          })
        )
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('com o bloqueio ligado sem opção válida, não confere (a API não grava esse estado)', () => {
    for (const opcao of [undefined, null, '', 'invalido']) {
      expect(checkEligibility(paramsCarteira(opcao, []))).toEqual({
        passes: true,
        failedCriterios: [],
      })
    }
  })

  it('soma aos demais bloqueios na ordem do Admin: PcD, idade, experiência, formação, idioma', () => {
    const result = checkEligibility({
      ...params({
        idade_minima: 200,
        criterios_bloqueio: bloqueios(
          'escolaridade',
          'idioma',
          'pcd',
          'experiencia_carteira'
        ),
        opcao_pcd: 'exclusiva',
        tipos_pcd: [],
        experiencia_carteira: 'minimo_6_meses',
      }),
      deficiencia: 'Nenhuma',
      experienciasCurriculo: [emCarteira(5)],
    })
    expect(result).toEqual({
      passes: false,
      failedCriterios: [
        { slug: 'pcd', label: FRASE_PCD },
        { slug: 'idade_minima', label: 'Ter pelo menos 200 anos' },
        { slug: 'experiencia_carteira', label: FRASE_6_MESES },
        { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
        { slug: 'idioma', label: LABEL_IDIOMA },
      ],
    })
  })

  it('quem atende a experiência em carteira só vê os demais critérios que falharam', () => {
    const result = checkEligibility({
      ...paramsCarteira('qualquer_tempo', [emCarteira(1)], {
        criterios_bloqueio: bloqueios('escolaridade', 'experiencia_carteira'),
        id_escolaridade_minima: 'sup',
      }),
    })
    expect(result.failedCriterios).toEqual([
      { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
    ])
  })
})

const FRASE_JOVEM_APRENDIZ = 'Ter entre 14 e 24 anos (Jovem Aprendiz)'

/** "Hoje" fixo dos testes de idade: 15/06/2026, meio-dia em Brasília (15h em UTC). */
const HOJE = new Date('2026-06-15T15:00:00Z')

/**
 * Data de nascimento de quem faz `anos` anos `deslocamentoDias` depois de 15/06/2026 (negativo =
 * já fez), em ISO à meia-noite UTC como a API devolve. Calculada em UTC, para valer em qualquer
 * fuso em que a suíte rode.
 */
function nascimentoCom(anos: number, deslocamentoDias = 0): string {
  return new Date(Date.UTC(2026 - anos, 5, 15 + deslocamentoDias)).toISOString()
}

/** Vaga só com o critério Jovem Aprendiz, com o bloqueio ligado. */
function paramsJovemAprendiz(
  nascimentoData: string | undefined,
  vagaExtra: Partial<Params['vaga']> = {}
): Params {
  return {
    ...params({
      id_escolaridade_minima: undefined,
      idiomas_requisito: [],
      jovem_aprendiz: true,
      criterios_bloqueio: bloqueios('jovem_aprendiz'),
      ...vagaExtra,
    }),
    nascimentoData,
  }
}

describe('checkEligibility — critério Jovem Aprendiz', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(HOJE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deixa passar quem tem de 14 a 24 anos, inclusive nas duas pontas', () => {
    for (const nascimento of [
      nascimentoCom(14),
      nascimentoCom(14, -1),
      nascimentoCom(18),
      nascimentoCom(24),
      nascimentoCom(25, 1),
    ]) {
      expect(checkEligibility(paramsJovemAprendiz(nascimento))).toEqual({
        passes: true,
        failedCriterios: [],
      })
    }
  })

  it('bloqueia quem está fora de 14 a 24 anos, com a frase do Jovem Aprendiz', () => {
    for (const nascimento of [
      nascimentoCom(14, 1),
      nascimentoCom(13),
      nascimentoCom(25),
      nascimentoCom(25, -1),
      nascimentoCom(40),
    ]) {
      expect(checkEligibility(paramsJovemAprendiz(nascimento))).toEqual({
        passes: false,
        failedCriterios: [
          { slug: 'jovem_aprendiz', label: FRASE_JOVEM_APRENDIZ },
        ],
      })
    }
  })

  it('bloqueia quem não tem data de nascimento no cadastro (ou tem data inválida)', () => {
    for (const nascimento of [undefined, '', 'data-invalida']) {
      expect(checkEligibility(paramsJovemAprendiz(nascimento))).toEqual({
        passes: false,
        failedCriterios: [
          { slug: 'jovem_aprendiz', label: FRASE_JOVEM_APRENDIZ },
        ],
      })
    }
  })

  it('com o bloqueio desligado, nunca bloqueia', () => {
    for (const criterios of [
      bloqueios(),
      bloqueios('escolaridade', 'idioma', 'pcd', 'experiencia_carteira'),
      undefined,
      null,
    ]) {
      expect(
        checkEligibility(
          paramsJovemAprendiz(undefined, { criterios_bloqueio: criterios })
        )
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('com o bloqueio ligado e a vaga sem Jovem Aprendiz, não confere (a API não grava esse estado)', () => {
    for (const jovemAprendiz of [false, null, undefined]) {
      expect(
        checkEligibility(
          paramsJovemAprendiz(nascimentoCom(40), {
            jovem_aprendiz: jovemAprendiz,
          })
        )
      ).toEqual({ passes: true, failedCriterios: [] })
    }
  })

  it('mantém a frase da idade mínima atual ao lado da frase do Jovem Aprendiz', () => {
    const result = checkEligibility(
      paramsJovemAprendiz(nascimentoCom(16), { idade_minima: 18 })
    )
    expect(result).toEqual({
      passes: false,
      failedCriterios: [
        { slug: 'idade_minima', label: 'Ter pelo menos 18 anos' },
      ],
    })
  })

  it('sem data de nascimento, mostra as duas frases da seção Idade, na ordem do Admin', () => {
    const result = checkEligibility(
      paramsJovemAprendiz(undefined, { idade_minima: 18 })
    )
    expect(result.failedCriterios).toEqual([
      { slug: 'idade_minima', label: 'Ter pelo menos 18 anos' },
      { slug: 'jovem_aprendiz', label: FRASE_JOVEM_APRENDIZ },
    ])
  })

  it('soma aos demais bloqueios na ordem do Admin: PcD, idade, Jovem Aprendiz, experiência, formação, idioma', () => {
    const result = checkEligibility({
      ...params({
        idade_minima: 200,
        jovem_aprendiz: true,
        criterios_bloqueio: bloqueios(
          'escolaridade',
          'idioma',
          'pcd',
          'experiencia_carteira',
          'jovem_aprendiz'
        ),
        opcao_pcd: 'exclusiva',
        tipos_pcd: [],
        experiencia_carteira: 'minimo_6_meses',
      }),
      nascimentoData: nascimentoCom(30),
      deficiencia: 'Nenhuma',
      experienciasCurriculo: [emCarteira(5)],
    })
    expect(result).toEqual({
      passes: false,
      failedCriterios: [
        { slug: 'pcd', label: FRASE_PCD },
        { slug: 'idade_minima', label: 'Ter pelo menos 200 anos' },
        { slug: 'jovem_aprendiz', label: FRASE_JOVEM_APRENDIZ },
        { slug: 'experiencia_carteira', label: FRASE_6_MESES },
        { slug: 'escolaridade', label: LABEL_ESCOLARIDADE },
        { slug: 'idioma', label: LABEL_IDIOMA },
      ],
    })
  })
})

describe('checkEligibility — idade no dia civil de Brasília, em qualquer fuso do servidor', () => {
  /** 15/06/2026 às 23h30 em Brasília: em UTC (e em Tóquio) já é 16/06. */
  const NOITE_EM_BRASILIA = new Date('2026-06-16T02:30:00Z')
  /** 16/06/2026 às 0h em Brasília: em Honolulu ainda é 15/06. */
  const MEIA_NOITE_EM_BRASILIA = new Date('2026-06-16T03:00:00Z')

  const FUSOS_DO_SERVIDOR = [
    { fuso: 'UTC', diaLocalNaNoite: 16 },
    { fuso: 'America/Sao_Paulo', diaLocalNaNoite: 15 },
    { fuso: 'Asia/Tokyo', diaLocalNaNoite: 16 },
    { fuso: 'Pacific/Honolulu', diaLocalNaNoite: 15 },
  ] as const

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  function paramsIdadeMinima18(nascimentoData: string): Params {
    return {
      ...params({
        id_escolaridade_minima: undefined,
        idiomas_requisito: [],
        idade_minima: 18,
      }),
      nascimentoData,
    }
  }

  const FRASE_IDADE_18 = {
    slug: 'idade_minima',
    label: 'Ter pelo menos 18 anos',
  }
  const BLOQUEIO_JOVEM_APRENDIZ = {
    passes: false,
    failedCriterios: [{ slug: 'jovem_aprendiz', label: FRASE_JOVEM_APRENDIZ }],
  }
  const PASSA = { passes: true, failedCriterios: [] }

  describe.each(FUSOS_DO_SERVIDOR)(
    'servidor em $fuso',
    ({ fuso, diaLocalNaNoite }) => {
      function noInstante(instante: Date) {
        vi.stubEnv('TZ', fuso)
        vi.useFakeTimers()
        vi.setSystemTime(instante)
      }

      it('o processo usa o fuso do cenário', () => {
        noInstante(NOITE_EM_BRASILIA)
        expect(new Date().getDate()).toBe(diaLocalNaNoite)
      })

      it('às 23h30 em Brasília, quem faz 18 anos amanhã ainda não tem a idade mínima', () => {
        noInstante(NOITE_EM_BRASILIA)
        for (const nascimento of [
          '2008-06-16',
          '2008-06-16T00:00:00Z',
          '2008-06-16T00:00:00.000Z',
        ]) {
          expect(checkEligibility(paramsIdadeMinima18(nascimento))).toEqual({
            passes: false,
            failedCriterios: [FRASE_IDADE_18],
          })
        }
      })

      it('às 23h30 em Brasília, quem faz 18 anos hoje tem a idade mínima', () => {
        noInstante(NOITE_EM_BRASILIA)
        for (const nascimento of ['2008-06-15', '2008-06-15T00:00:00Z']) {
          expect(checkEligibility(paramsIdadeMinima18(nascimento))).toEqual(
            PASSA
          )
        }
      })

      it('à meia-noite em Brasília, quem faz 18 anos nesse dia já tem a idade mínima', () => {
        noInstante(MEIA_NOITE_EM_BRASILIA)
        expect(checkEligibility(paramsIdadeMinima18('2008-06-16'))).toEqual(
          PASSA
        )
      })

      it('às 23h30 em Brasília, confere os limites de 14 e 24 anos do Jovem Aprendiz no dia de Brasília', () => {
        noInstante(NOITE_EM_BRASILIA)
        // faz 14 amanhã: ainda tem 13
        expect(checkEligibility(paramsJovemAprendiz('2012-06-16'))).toEqual(
          BLOQUEIO_JOVEM_APRENDIZ
        )
        // fez 14 hoje
        expect(checkEligibility(paramsJovemAprendiz('2012-06-15'))).toEqual(
          PASSA
        )
        // faz 25 amanhã: ainda tem 24
        expect(
          checkEligibility(paramsJovemAprendiz('2001-06-16T00:00:00Z'))
        ).toEqual(PASSA)
        // fez 25 hoje
        expect(checkEligibility(paramsJovemAprendiz('2001-06-15'))).toEqual(
          BLOQUEIO_JOVEM_APRENDIZ
        )
      })

      it('data de nascimento fora do calendário não passa', () => {
        noInstante(NOITE_EM_BRASILIA)
        for (const nascimento of ['2008-02-30', '2008-13-01', '15/06/2008']) {
          expect(checkEligibility(paramsIdadeMinima18(nascimento))).toEqual({
            passes: false,
            failedCriterios: [FRASE_IDADE_18],
          })
        }
      })
    }
  )
})
