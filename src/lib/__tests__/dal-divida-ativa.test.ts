import {
  getDalDividaAtivaCadastroFazenda,
  getDalDividaAtivaConsultaInscricao,
  getDalDividaAtivaDebitos,
  getDalDividaAtivaImoveis,
} from '@/lib/dal'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA
const CPF = '12345678901'

describe('getDalDividaAtivaImoveis', () => {
  /**
   * A trava mais importante deste arquivo. A API devolve **array cru** e o spec do Quarkus
   * tipa objeto singular; o DAL fazia `result.data?.data`, que num array resolve para
   * `undefined` e cairia no `[]` — o cidadão com imóvel veria "nenhum imóvel cadastrado",
   * sem erro nem log. Se alguém reintroduzir o acesso ao envelope, este teste cai.
   */
  test('devolve os imóveis do cidadão a partir do array cru da API', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json(
          [
            {
              id: 32,
              cpf: '12345678909',
              dataInclusao: '2026-06-22T15:40:46.477',
              endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
              numInscricao: '00000018',
            },
          ],
          { status: 200 }
        )
      )
    )

    const imoveis = await getDalDividaAtivaImoveis(CPF)

    expect(imoveis).toEqual([
      {
        id: 32,
        inscricao: '00000018',
        endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
        nome: null,
        bairro: null,
        proprietario: null,
        possuiDebitos: null,
        cadastradoEm: '2026-06-22',
      },
    ])
  })

  test('devolve lista vazia quando o cidadão não tem imóvel cadastrado', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json([], { status: 200 })
      )
    )

    await expect(getDalDividaAtivaImoveis(CPF)).resolves.toEqual([])
  })

  // A landing não pode cair por causa do contador de imóveis.
  test('devolve lista vazia quando a API falha, em vez de propagar o erro', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json({ error: 'HTTP 401 Unauthorized' }, { status: 401 })
      )
    )

    await expect(getDalDividaAtivaImoveis(CPF)).resolves.toEqual([])
  })

  test('não serve dado pessoal de cache: cada leitura vai à API', async () => {
    let chamadas = 0

    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () => {
        chamadas += 1
        return HttpResponse.json([], { status: 200 })
      })
    )

    await getDalDividaAtivaImoveis(CPF)
    await getDalDividaAtivaImoveis(CPF)

    expect(chamadas).toBe(2)
  })
})

/**
 * ⚠️ Este endpoint consulta um imóvel **já cadastrado** — não é a consulta prévia que a
 * tela "Confirme sua inscrição" precisaria. A premissa P20 está em aberto por causa disso;
 * ver `docs/divida-ativa.md`. Os testes abaixo cobrem o comportamento real da API, não o
 * comportamento que o desenho pressupõe.
 */
describe('getDalDividaAtivaConsultaInscricao', () => {
  beforeEach(() => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/consulta`, ({ params }) =>
        params.inscricao === '00000018'
          ? HttpResponse.json(
              {
                imovel: {
                  id: 32,
                  dataInclusao: '2026-06-22T15:40:46.477',
                  endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
                  numInscricao: '00000018',
                },
                opcoes: [],
              },
              { status: 200 }
            )
          : // A API real devolve 404 com corpo vazio para inscrição não cadastrada.
            new HttpResponse(null, { status: 404 })
      )
    )
  })

  test('devolve o imóvel cadastrado na linguagem do produto', async () => {
    const imovel = await getDalDividaAtivaConsultaInscricao('00000018', CPF)

    expect(imovel?.id).toBe(32)
    expect(imovel?.endereco).toBe('RUA EXEMPLO, 123 / LOJA A - BAIRRO')
  })

  test('devolve null quando a inscrição não está cadastrada, sem lançar', async () => {
    await expect(
      getDalDividaAtivaConsultaInscricao('99999999', CPF)
    ).resolves.toBeNull()
  })

  // A resposta é `{ imovel, opcoes }`: um 200 sem `imovel` não pode virar um objeto vazio.
  test('devolve null quando o 200 vem sem o imóvel', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/consulta`, () =>
        HttpResponse.json({ opcoes: [] }, { status: 200 })
      )
    )

    await expect(
      getDalDividaAtivaConsultaInscricao('00000018', CPF)
    ).resolves.toBeNull()
  })

  test('normaliza a máscara antes de consultar', async () => {
    const imovel = await getDalDividaAtivaConsultaInscricao('0.000.001-8', CPF)

    expect(imovel?.inscricao).toBe('00000018')
  })
})

/**
 * A consulta prévia à Fazenda que a tela "Confirme sua inscrição" precisa: consulta sem
 * gravar. É o endpoint que resolveu a premissa P20 — antes dele a tela caía sempre no
 * estado "não encontrado" para imóvel novo, porque a única consulta disponível exigia o
 * imóvel já cadastrado.
 *
 * Diferente de `getDalDividaAtivaImoveis`, aqui **não** engolimos a falha em silêncio por
 * conveniência: devolvemos `null` porque a tela tem um estado desenhado para "não
 * encontrado". O que não pode acontecer é estourar o error boundary da rota.
 */
describe('getDalDividaAtivaCadastroFazenda', () => {
  beforeEach(() => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/cadastro`, ({ params }) =>
        params.inscricao === '00000018'
          ? HttpResponse.json(
              {
                endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
                numInscricao: '00000018',
              },
              { status: 200 }
            )
          : new HttpResponse(null, { status: 400 })
      )
    )
  })

  test('devolve o imóvel consultado na Fazenda, ainda não cadastrado', async () => {
    const imovel = await getDalDividaAtivaCadastroFazenda('00000018', CPF)

    expect(imovel?.inscricao).toBe('00000018')
    expect(imovel?.endereco).toBe('RUA EXEMPLO, 123 / LOJA A - BAIRRO')
    // Ainda não gravado: sem id local, não há o que excluir.
    expect(imovel?.id).toBeNull()
    expect(imovel?.cadastradoEm).toBeNull()
  })

  test('devolve null para inscrição inválida, sem lançar', async () => {
    await expect(
      getDalDividaAtivaCadastroFazenda('99999999', CPF)
    ).resolves.toBeNull()
  })

  // "Retorna lista vazia quando nao houver registro para a inscricao" — descrição da API.
  test('devolve null quando o 200 vem com lista vazia', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/cadastro`, () =>
        HttpResponse.json([], { status: 200 })
      )
    )

    await expect(
      getDalDividaAtivaCadastroFazenda('00000018', CPF)
    ).resolves.toBeNull()
  })

  /**
   * O 503 é o caminho mais provável de falha aqui: a própria API documenta "Falha ao
   * validar token no Keycloak ou ao consultar o WSFazenda_Iptu", e o WS da Fazenda é a
   * dependência lenta e instável da pilha. A tela mostra "não encontramos essa inscrição"
   * em vez de uma tela de erro — o cidadão pode tentar de novo.
   */
  test('devolve null quando o WSFazenda falha (503), sem lançar', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/cadastro`, () =>
        HttpResponse.json(
          { error: 'Falha ao consultar imovel no WS Fazenda IPTU.' },
          { status: 503 }
        )
      )
    )

    await expect(
      getDalDividaAtivaCadastroFazenda('00000018', CPF)
    ).resolves.toBeNull()
  })

  test('normaliza a máscara antes de consultar', async () => {
    const imovel = await getDalDividaAtivaCadastroFazenda('0.000.001-8', CPF)

    expect(imovel?.inscricao).toBe('00000018')
  })

  test('não serve dado pessoal de cache: cada leitura vai à API', async () => {
    let chamadas = 0

    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/cadastro`, () => {
        chamadas += 1
        return HttpResponse.json({ numInscricao: '00000018' }, { status: 200 })
      })
    )

    await getDalDividaAtivaCadastroFazenda('00000018', CPF)
    await getDalDividaAtivaCadastroFazenda('00000018', CPF)

    expect(chamadas).toBe(2)
  })
})

describe('getDalDividaAtivaDebitos', () => {
  const INSCRICAO = '00000018'

  test('devolve CDAs, guias parceladas e totais do imóvel', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json(
          {
            imovel: {
              id: 32,
              dataInclusao: '2026-06-22T15:40:46.477',
              endereco: 'RUA EXEMPLO, 123',
              numInscricao: '00000018',
              nome: 'Casa de praia',
            },
            imovelCadastrado: true,
            cdas: [
              {
                cdaId: '111',
                exercicio: '2024',
                naturezaDivida: 'IPTU',
                situacaoPrincipal: 'EM ABERTO',
                valorSaldoPrincipal: '1.000,00',
                valorSaldoHonorarios: '100,00',
                selecionavelParcelamento: true,
              },
            ],
            totalCdas: 1,
            guiasParceladas: [
              { numeroGuia: '900123', descricaoSituacaoGuia: 'EM DIA' },
            ],
            totalParcelado: 1,
            totalDebitos: 2,
            mensagem: null,
          },
          { status: 200 }
        )
      )
    )

    const debitos = await getDalDividaAtivaDebitos(INSCRICAO, CPF)

    expect(debitos?.imovelCadastrado).toBe(true)
    expect(debitos?.imovel?.inscricao).toBe('00000018')
    expect(debitos?.cdas).toHaveLength(1)
    expect(debitos?.cdas[0]).toMatchObject({
      numeroCda: '111',
      exercicio: 2024,
      natureza: 'IPTU',
      valorPrincipal: 1000,
      valorHonorarios: 100,
      parcelavel: true,
    })
    expect(debitos?.guiasParceladas).toHaveLength(1)
    expect(debitos?.totalDebitos).toBe(2)
  })

  /**
   * "Sem débito" é um estado de tela legítimo, não um erro — a API inclusive manda uma
   * `mensagem` amigável junto. Devolver `null` aqui faria a tela dizer "não encontramos o
   * imóvel" para quem simplesmente está em dia.
   */
  test('devolve estrutura vazia, não null, quando o imóvel não tem débito', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json(
          {
            imovel: { numInscricao: '00000018' },
            imovelCadastrado: true,
            cdas: [],
            guiasParceladas: [],
            totalCdas: 0,
            totalParcelado: 0,
            totalDebitos: 0,
            mensagem: 'Nao ha debitos inscritos em divida ativa.',
          },
          { status: 200 }
        )
      )
    )

    const debitos = await getDalDividaAtivaDebitos(INSCRICAO, CPF)

    expect(debitos?.cdas).toEqual([])
    expect(debitos?.guiasParceladas).toEqual([])
    expect(debitos?.totalDebitos).toBe(0)
    expect(debitos?.mensagem).toBe('Nao ha debitos inscritos em divida ativa.')
  })

  // Listas ausentes no corpo não podem virar `undefined` numa tela que faz `.map()`.
  test('tolera listas ausentes no corpo da resposta', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json({ imovelCadastrado: true }, { status: 200 })
      )
    )

    const debitos = await getDalDividaAtivaDebitos(INSCRICAO, CPF)

    expect(debitos?.cdas).toEqual([])
    expect(debitos?.guiasParceladas).toEqual([])
    expect(debitos?.totalDebitos).toBe(0)
  })

  /**
   * 404 é o que a API responde para inscrição que não está em Meus Imóveis — este endpoint
   * exige o imóvel cadastrado. A tela tem estado para isso; estourar o error boundary seria
   * pior para quem só digitou a inscrição errada.
   */
  test('devolve null quando o imóvel não está cadastrado (404)', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json({ error: 'Nao encontrado' }, { status: 404 })
      )
    )

    await expect(getDalDividaAtivaDebitos(INSCRICAO, CPF)).resolves.toBeNull()
  })

  test('devolve null quando a API falha', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json({ error: 'Indisponivel' }, { status: 503 })
      )
    )

    await expect(getDalDividaAtivaDebitos(INSCRICAO, CPF)).resolves.toBeNull()
  })

  /**
   * Regra de ouro nº 2 do plano: dado financeiro nunca vai para cache. Este teste vigia a
   * inscrição normalizada no path e existe sobretudo para documentar a expectativa de que
   * a chamada saia com `no-store` — se alguém trocar por `unstable_cache`, o CPF do cookie
   * vazaria entre cidadãos.
   */
  test('normaliza a inscrição para somente dígitos no path', async () => {
    let pathChamado = ''
    server.use(
      http.get(
        `${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`,
        ({ params }) => {
          pathChamado = String(params.inscricao)
          return HttpResponse.json({ imovelCadastrado: true }, { status: 200 })
        }
      )
    )

    await getDalDividaAtivaDebitos('0.000.001-8', CPF)

    expect(pathChamado).toBe('00000018')
  })
})
