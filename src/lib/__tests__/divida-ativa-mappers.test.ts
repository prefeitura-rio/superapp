import {
  mapApiToImovel,
  mapApiToMensagemErro,
  mapFazendaToImovel,
  normalizarConsultaFazenda,
  normalizarListaImoveis,
  parseDataApi,
  parseValorMonetario,
} from '@/lib/divida-ativa-mappers'
import { describe, expect, test } from 'vitest'

describe('parseValorMonetario', () => {
  test('mantém um número devolvido pela API', () => {
    expect(parseValorMonetario(1890.72)).toBe(1890.72)
  })

  test('converte string no formato pt-BR com milhar e decimal', () => {
    expect(parseValorMonetario('1.234,56')).toBe(1234.56)
  })

  test('converte string no formato decimal com ponto', () => {
    expect(parseValorMonetario('1234.56')).toBe(1234.56)
  })

  test('converte string com símbolo de moeda', () => {
    expect(parseValorMonetario('R$ 1.234,56')).toBe(1234.56)
  })

  test('devolve null para ausente', () => {
    expect(parseValorMonetario(undefined)).toBeNull()
  })

  test('devolve null para valor não numérico', () => {
    expect(parseValorMonetario('indisponível')).toBeNull()
  })

  test('preserva o zero em vez de tratá-lo como ausente', () => {
    expect(parseValorMonetario(0)).toBe(0)
  })
})

describe('parseDataApi', () => {
  test('mantém uma data ISO', () => {
    expect(parseDataApi('2023-03-10')).toBe('2023-03-10')
  })

  // A API real devolve dd/MM/yyyy nos campos vindos do DAM (verificado em 17/08/2026).
  test('converte data no formato brasileiro para ISO', () => {
    expect(parseDataApi('24/04/2026')).toBe('2026-04-24')
  })

  // `dataInclusao` vem como LocalDateTime sem fuso, com centésimos.
  test('reduz um date-time sem fuso para a data', () => {
    expect(parseDataApi('2026-06-22T15:40:46.477')).toBe('2026-06-22')
  })

  test('devolve null para ausente', () => {
    expect(parseDataApi(undefined)).toBeNull()
  })

  test('devolve null para data inválida', () => {
    expect(parseDataApi('31/02/abc')).toBeNull()
  })
})

describe('mapApiToImovel', () => {
  test('mapeia a resposta real da API para o tipo de visão', () => {
    const imovel = mapApiToImovel({
      id: 32,
      cpf: '12345678909',
      dataInclusao: '2026-06-22T15:40:46.477',
      endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
      numInscricao: '00000018',
    })

    expect(imovel).toEqual({
      id: 32,
      inscricao: '00000018',
      endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
      bairro: null,
      proprietario: null,
      possuiDebitos: null,
      cadastradoEm: '2026-06-22',
    })
  })

  // O CPF vem no corpo da resposta, mas identidade é sempre derivada do token —
  // nada de CPF atravessa a fronteira para o tipo de visão (LGPD).
  test('não propaga o CPF devolvido pela API', () => {
    const imovel = mapApiToImovel({
      numInscricao: '00000018',
      cpf: '12345678909',
    })

    expect(Object.keys(imovel)).not.toContain('cpf')
  })

  test('normaliza a inscrição removendo máscara', () => {
    expect(mapApiToImovel({ numInscricao: '0.521.766-3' }).inscricao).toBe(
      '05217663'
    )
  })

  // P19: `ImovelResponse` não tem proprietário. P12: `GET /imoveis` não consulta a
  // Fazenda, então não há como saber se existe débito.
  test('deixa proprietário e débitos indefinidos porque a API não os devolve', () => {
    const imovel = mapApiToImovel({ numInscricao: '00000018' })

    expect(imovel.proprietario).toBeNull()
    expect(imovel.possuiDebitos).toBeNull()
  })

  // O bairro vem embutido na string de endereço ("... - BAIRRO") e fatiar por " - " é
  // frágil: endereço com hífen no nome quebraria. Fica null até haver decisão.
  test('não tenta extrair o bairro do endereço', () => {
    const imovel = mapApiToImovel({
      numInscricao: '00000018',
      endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
    })

    expect(imovel.bairro).toBeNull()
  })

  test('campos ausentes viram null sem quebrar', () => {
    const imovel = mapApiToImovel({})

    expect(imovel).toEqual({
      id: null,
      inscricao: '',
      endereco: null,
      bairro: null,
      proprietario: null,
      possuiDebitos: null,
      cadastradoEm: null,
    })
  })
})

describe('normalizarListaImoveis', () => {
  // A API real devolve array cru; o spec do Quarkus tipa objeto singular, então o tipo
  // gerado mente. O normalizador aceita as duas formas para a correção do spec não virar
  // uma quebra em produção.
  test('aceita o array cru que a API devolve', () => {
    const lista = normalizarListaImoveis([
      { id: 32, numInscricao: '00000018' },
      { id: 33, numInscricao: '00000019' },
    ])

    expect(lista).toHaveLength(2)
    expect(lista[0].id).toBe(32)
  })

  test('aceita um objeto único, como o spec declara hoje', () => {
    expect(
      normalizarListaImoveis({ id: 32, numInscricao: '00000018' })
    ).toEqual([{ id: 32, numInscricao: '00000018' }])
  })

  test('aceita o envelope { data: [...] } caso a API passe a usá-lo', () => {
    const lista = normalizarListaImoveis({
      data: [{ id: 32, numInscricao: '00000018' }],
    })

    expect(lista).toEqual([{ id: 32, numInscricao: '00000018' }])
  })

  test('devolve lista vazia para ausente, nulo ou tipo inesperado', () => {
    expect(normalizarListaImoveis(undefined)).toEqual([])
    expect(normalizarListaImoveis(null)).toEqual([])
    expect(normalizarListaImoveis('erro')).toEqual([])
  })
})

describe('mapApiToMensagemErro', () => {
  // P10 revista com a API real: envelope é `{ error: string }` sem `code`, e a
  // exibibilidade depende do status. Em 400 a mensagem é de negócio, em português.
  // Caso conhecido: a API manda em tom de sistema e sem acento; a tela mostra a copy do
  // produto.
  test('troca a mensagem conhecida pela copy do produto', () => {
    expect(
      mapApiToMensagemErro(
        { error: 'Este imovel ja esta cadastrado para o usuario.' },
        400
      )
    ).toBe('Este imóvel já está na sua lista.')
  })

  // O casamento é feito sobre a forma normalizada, então continua valendo se o Vladimir
  // acentuar as mensagens ou mexer na pontuação.
  test('reconhece a mensagem conhecida mesmo acentuada ou repontuada', () => {
    expect(
      mapApiToMensagemErro(
        { error: 'Este imóvel já está cadastrado para o usuário!' },
        400
      )
    ).toBe('Este imóvel já está na sua lista.')
  })

  // Mensagem de negócio que ainda não mapeamos é melhor que uma genérica.
  test('deixa passar a mensagem de negócio que ainda não tem copy própria', () => {
    expect(
      mapApiToMensagemErro(
        { error: 'Informe ao menos uma CDA para simular o parcelamento.' },
        400
      )
    ).toBe('Informe ao menos uma CDA para simular o parcelamento.')
  })

  test('não exibe o texto técnico de um 401', () => {
    expect(
      mapApiToMensagemErro({ error: 'HTTP 401 Unauthorized' }, 401)
    ).toBeNull()
  })

  // O 502 vaza nome de sistema interno ("WS Fazenda IPTU") — nunca vai para a tela.
  test('não exibe a mensagem de um 502, que vaza sistema interno', () => {
    expect(
      mapApiToMensagemErro(
        { error: 'Falha ao consultar imovel no WS Fazenda IPTU.' },
        502
      )
    ).toBeNull()
  })

  test('devolve null quando o 404 vem sem corpo', () => {
    expect(mapApiToMensagemErro(undefined, 404)).toBeNull()
  })

  test('devolve null para corpo sem a chave error', () => {
    expect(mapApiToMensagemErro({ mensagem: 'outra forma' }, 400)).toBeNull()
  })

  test('devolve null para error vazio', () => {
    expect(mapApiToMensagemErro({ error: '' }, 400)).toBeNull()
  })
})

/**
 * `GET /imoveis/{inscricao}/cadastro` é a consulta prévia à Fazenda que resolveu a premissa
 * P20 — a saída A registrada em `docs/divida-ativa.md`, que preserva as três telas do Figma.
 *
 * O contrato é ambíguo quanto à forma da resposta: o schema declara `FazendaImovel`, um
 * objeto, mas a descrição do endpoint diz "Retorna **lista vazia** quando nao houver
 * registro para a inscricao". É a mesma divergência da premissa P11, em que `GET /imoveis`
 * é tipado como objeto e devolve array cru — e lá ela custou uma lista silenciosamente
 * vazia. Estes testes travam as duas formas para que a correção do spec de qualquer um dos
 * lados não vire quebra silenciosa.
 */
describe('normalizarConsultaFazenda', () => {
  test('aceita o objeto singular declarado no schema', () => {
    expect(
      normalizarConsultaFazenda({
        endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
        numInscricao: '00000018',
      })
    ).toEqual({
      endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
      numInscricao: '00000018',
    })
  })

  test('desembrulha o primeiro item quando a API devolve array', () => {
    expect(normalizarConsultaFazenda([{ numInscricao: '00000018' }])).toEqual({
      numInscricao: '00000018',
    })
  })

  // "Retorna lista vazia quando nao houver registro" — este é o caminho do não encontrado.
  test('devolve null para a lista vazia da inscrição sem registro', () => {
    expect(normalizarConsultaFazenda([])).toBeNull()
  })

  test('devolve null para corpo ausente ou não-objeto', () => {
    expect(normalizarConsultaFazenda(undefined)).toBeNull()
    expect(normalizarConsultaFazenda(null)).toBeNull()
    expect(normalizarConsultaFazenda('')).toBeNull()
  })

  // Um 200 com objeto vazio não é imóvel encontrado: sem inscrição não há o que confirmar.
  test('devolve null para objeto sem inscrição', () => {
    expect(normalizarConsultaFazenda({})).toBeNull()
  })
})

describe('mapFazendaToImovel', () => {
  test('traduz endereço e inscrição para a linguagem do produto', () => {
    const imovel = mapFazendaToImovel({
      endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
      numInscricao: '00000018',
    })

    expect(imovel.inscricao).toBe('00000018')
    expect(imovel.endereco).toBe('RUA EXEMPLO, 123 / LOJA A - BAIRRO')
  })

  /**
   * A diferença que importa entre este mapper e `mapApiToImovel`: aqui o imóvel **ainda não
   * está cadastrado**. `id` null é o que impede a tela de oferecer exclusão de algo que não
   * existe no banco local, e `cadastradoEm` null é a verdade — não há data de inclusão.
   */
  test('deixa id e cadastradoEm nulos porque o imóvel ainda não foi gravado', () => {
    const imovel = mapFazendaToImovel({ numInscricao: '00000018' })

    expect(imovel.id).toBeNull()
    expect(imovel.cadastradoEm).toBeNull()
  })

  // Mesmas ausências de `mapApiToImovel`: `FazendaImovel` traz só endereço e inscrição.
  test('mantém proprietário, bairro e débitos ausentes (P19, P22, P12)', () => {
    const imovel = mapFazendaToImovel({ numInscricao: '00000018' })

    expect(imovel.proprietario).toBeNull()
    expect(imovel.bairro).toBeNull()
    expect(imovel.possuiDebitos).toBeNull()
  })
})
