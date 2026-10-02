import {
  getDalDividaAtivaCadastroFazenda,
  getDalDividaAtivaConsultaAvulsa,
  getDalDividaAtivaConsultaInscricao,
  getDalDividaAtivaDatasVencimento,
  getDalDividaAtivaDebitos,
  getDalDividaAtivaImoveis,
  getDalDividaAtivaSimulacao,
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

    const resultado = await getDalDividaAtivaDebitos(INSCRICAO, CPF)
    const debitos = resultado.situacao === 'ok' ? resultado.debitos : null

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

    const resultado = await getDalDividaAtivaDebitos(INSCRICAO, CPF)
    const debitos = resultado.situacao === 'ok' ? resultado.debitos : null

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

    const resultado = await getDalDividaAtivaDebitos(INSCRICAO, CPF)
    const debitos = resultado.situacao === 'ok' ? resultado.debitos : null

    expect(debitos?.cdas).toEqual([])
    expect(debitos?.guiasParceladas).toEqual([])
    expect(debitos?.totalDebitos).toBe(0)
  })

  /**
   * 404 e 503 não podem chegar à tela como a mesma coisa. Um diz "o imóvel não está no seu
   * cadastro" — tentar de novo não resolve, cadastrar resolve. O outro diz "o serviço está
   * fora" — o número está certo e tentar de novo mais tarde resolve. Era isso que o `null`
   * de antes apagava.
   */
  test('404 vira não-cadastrado', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json({ error: 'Nao encontrado' }, { status: 404 })
      )
    )

    await expect(getDalDividaAtivaDebitos(INSCRICAO, CPF)).resolves.toEqual({
      situacao: 'nao-cadastrado',
    })
  })

  /**
   * O corpo é o que homologação devolveu de verdade em 22/09/2026 para uma inscrição
   * cadastrada e válida.
   */
  test('503 vira indisponível', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
        HttpResponse.json(
          { error: 'Servico de Divida Ativa indisponivel no momento.' },
          { status: 503 }
        )
      )
    )

    await expect(getDalDividaAtivaDebitos(INSCRICAO, CPF)).resolves.toEqual({
      situacao: 'indisponivel',
    })
  })

  /** Qualquer outra falha é indisponibilidade: o cidadão não tem o que corrigir. */
  test('401 e 500 também viram indisponível', async () => {
    for (const status of [401, 500]) {
      server.use(
        http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/divida-ativa`, () =>
          HttpResponse.json({}, { status })
        )
      )

      await expect(getDalDividaAtivaDebitos(INSCRICAO, CPF)).resolves.toEqual({
        situacao: 'indisponivel',
      })
    }
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

describe('getDalDividaAtivaConsultaAvulsa', () => {
  /**
   * A razão de esta função existir. `GET /imoveis/{inscricao}/divida-ativa` exige o imóvel
   * cadastrado e só aceita inscrição no path — não há onde colocar uma CDA ou uma execução
   * fiscal. A consulta avulsa é o único caminho para os outros dois modos da tela de entrada.
   */
  /**
   * A CDA vai com barras: a API só reordena o ano quando vê a barra, e os 12 dígitos da carta
   * (`SSNNNNNNAAAA…`) sem ela seriam lidos com o ano no lugar errado.
   */
  test('consulta por CDA enviando somente numCda, com barras', async () => {
    let corpo: unknown = null

    server.use(
      http.post(
        `${DIVIDA_ATIVA}/divida-ativa/consultar`,
        async ({ request }) => {
          corpo = await request.json()

          return HttpResponse.json(
            {
              imovel: null,
              imovelCadastrado: false,
              cdas: [],
              totalCdas: 0,
              guiasParceladas: [],
              totalParcelado: 0,
              totalDebitos: 0,
              mensagem: null,
            },
            { status: 200 }
          )
        }
      )
    )

    await getDalDividaAtivaConsultaAvulsa(
      { tipo: 'cda', valor: '01021580200300' },
      CPF
    )

    // Critério único: os outros campos não podem ir junto, nem como `undefined` explícito.
    expect(corpo).toEqual({ numCda: '01/021580/2003-00' })
  })

  test('consulta por execução fiscal enviando somente numExecucaoFiscal', async () => {
    let corpo: unknown = null

    server.use(
      http.post(
        `${DIVIDA_ATIVA}/divida-ativa/consultar`,
        async ({ request }) => {
          corpo = await request.json()

          return HttpResponse.json(
            {
              imovel: null,
              imovelCadastrado: false,
              cdas: [],
              totalCdas: 0,
              guiasParceladas: [],
              totalParcelado: 0,
              totalDebitos: 0,
              mensagem: null,
            },
            { status: 200 }
          )
        }
      )
    )

    await getDalDividaAtivaConsultaAvulsa(
      { tipo: 'execucao-fiscal', valor: '00071070720188190001' },
      CPF
    )

    expect(corpo).toEqual({ numExecucaoFiscal: '00071070720188190001' })
  })

  /**
   * A máscara é exibição, nunca transporte — a mesma regra do formulário de entrada. Se o
   * critério chegar pontuado pela URL, o que vai para a API são só os dígitos.
   */
  test('envia somente os dígitos do critério', async () => {
    let corpo: unknown = null

    server.use(
      http.post(
        `${DIVIDA_ATIVA}/divida-ativa/consultar`,
        async ({ request }) => {
          corpo = await request.json()

          return HttpResponse.json(
            {
              imovel: null,
              imovelCadastrado: false,
              cdas: [],
              totalCdas: 0,
              guiasParceladas: [],
              totalParcelado: 0,
              totalDebitos: 0,
              mensagem: null,
            },
            { status: 200 }
          )
        }
      )
    )

    await getDalDividaAtivaConsultaAvulsa(
      { tipo: 'inscricao', valor: '0.521.766-3' },
      CPF
    )

    expect(corpo).toEqual({ numInscricao: '05217663' })
  })

  test('mapeia a resposta para o mesmo tipo de visão da consulta por inscrição', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/consultar`, () =>
        HttpResponse.json(
          {
            imovel: null,
            imovelCadastrado: false,
            cdas: [
              {
                cdaId: '20240000111',
                exercicio: '2024',
                naturezaDivida: 'IPTU',
                receita: 'IPTU/Taxas - Predial',
                situacaoPrincipal: 'EM ABERTO',
                situacaoHonorarios: 'EM ABERTO',
                faseCobranca: 'AJUIZADA',
                valorSaldoPrincipal: '1.534,21',
                valorSaldoHonorarios: '153,42',
                inscricaoImobiliaria: '00000018',
                selecionavelParcelamento: true,
                protocoloRequerimentoAberto: null,
              },
            ],
            totalCdas: 1,
            guiasParceladas: [],
            totalParcelado: 0,
            totalDebitos: 1,
            mensagem: null,
          },
          { status: 200 }
        )
      )
    )

    const resultado = await getDalDividaAtivaConsultaAvulsa(
      { tipo: 'cda', valor: '20240000111' },
      CPF
    )
    const debitos = resultado.situacao === 'ok' ? resultado.debitos : null

    expect(debitos?.cdas).toHaveLength(1)
    expect(debitos?.cdas[0]).toMatchObject({
      numeroCda: '20240000111',
      exercicio: 2024,
      natureza: 'IPTU',
      valorPrincipal: 1534.21,
      valorHonorarios: 153.42,
      parcelavel: true,
    })
    // Consulta avulsa é somente leitura: a API sinaliza que o imóvel não está em Meus Imóveis.
    expect(debitos?.imovelCadastrado).toBe(false)
  })

  /**
   * "Sem débito" **não** é `null`: é 200 com listas vazias, e a tela tem estado próprio —
   * a do Figma diz "Não encontramos nenhum débito associado ao número informado". Confundir
   * os dois mandaria o cidadão para o error boundary em vez da tela desenhada.
   */
  test('resposta vazia devolve objeto com listas vazias, não null', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/consultar`, () =>
        HttpResponse.json(
          {
            imovel: null,
            imovelCadastrado: false,
            cdas: [],
            totalCdas: 0,
            guiasParceladas: [],
            totalParcelado: 0,
            totalDebitos: 0,
            mensagem: 'Nao ha debitos inscritos em divida ativa.',
          },
          { status: 200 }
        )
      )
    )

    const resultado = await getDalDividaAtivaConsultaAvulsa(
      { tipo: 'cda', valor: '99999' },
      CPF
    )
    const debitos = resultado.situacao === 'ok' ? resultado.debitos : null

    expect(debitos).not.toBeNull()
    expect(debitos?.cdas).toEqual([])
    expect(debitos?.mensagem).toBe('Nao ha debitos inscritos em divida ativa.')
  })

  test('devolve null quando a API não responde 200', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/consultar`, () =>
        HttpResponse.json({}, { status: 503 })
      )
    )

    await expect(
      getDalDividaAtivaConsultaAvulsa(
        { tipo: 'cda', valor: '20240000111' },
        CPF
      )
    ).resolves.toEqual({ situacao: 'indisponivel' })
  })

  /**
   * `POST /divida-ativa/consultar` responde 404 em homologação porque a **rota** não foi
   * deployada, não porque o imóvel não exista. Mapear isso para "não cadastrado" mandaria o
   * cidadão cadastrar um imóvel que já está cadastrado — daí este endpoint tratar 404 como
   * indisponibilidade, ao contrário do GET.
   */
  test('404 aqui é rota ausente, não imóvel não cadastrado', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/consultar`, () =>
        HttpResponse.json({}, { status: 404 })
      )
    )

    await expect(
      getDalDividaAtivaConsultaAvulsa(
        { tipo: 'cda', valor: '20240000111' },
        CPF
      )
    ).resolves.toEqual({ situacao: 'indisponivel' })
  })
})

describe('getDalDividaAtivaDatasVencimento', () => {
  test('pede as datas de parcelamento e devolve a lista do DAM', async () => {
    let tipo: string | null = null
    server.use(
      http.get(
        `${DIVIDA_ATIVA}/divida-ativa/datas-vencimento`,
        ({ request }) => {
          tipo = new URL(request.url).searchParams.get('tipo')
          return HttpResponse.json(
            { datas: ['05/10/2026', '05/11/2026'] },
            { status: 200 }
          )
        }
      )
    )

    expect(await getDalDividaAtivaDatasVencimento()).toEqual([
      '05/10/2026',
      '05/11/2026',
    ])
    expect(tipo).toBe('PARCELAMENTO')
  })

  test('devolve null quando a API falha, para a tela distinguir de "sem datas"', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/divida-ativa/datas-vencimento`, () =>
        HttpResponse.json({ error: 'indisponivel' }, { status: 503 })
      )
    )

    expect(await getDalDividaAtivaDatasVencimento()).toBeNull()
  })
})

describe('getDalDividaAtivaSimulacao', () => {
  const CDAS = ['202001234567']
  const DATA = '05/10/2026'

  test('simula pelas CDAs e pela data, sem inscrição, e devolve as opções', async () => {
    let corpo: unknown
    server.use(
      http.post(
        `${DIVIDA_ATIVA}/divida-ativa/parcelamentos/simular`,
        async ({ request }) => {
          corpo = await request.json()
          return HttpResponse.json(
            {
              opcoes: [
                {
                  qtdeParcelas: 1,
                  valor1aParcela: '1.357,89',
                  valorDescontos: '100,00',
                },
                { qtdeParcelas: 12, valor1aParcela: '127,53' },
                { valor1aParcela: '0,00' },
              ],
            },
            { status: 200 }
          )
        }
      )
    )

    const simulacao = await getDalDividaAtivaSimulacao(CDAS, DATA, CPF)

    expect(corpo).toEqual({ cdas: CDAS, dataVencimento: DATA })
    // Opção sem quantidade não é escolhível e sai da lista.
    expect(simulacao).toEqual({
      situacao: 'ok',
      opcoes: [
        {
          qtdeParcelas: 1,
          valor1aParcela: '1.357,89',
          valorDescontos: '100,00',
        },
        { qtdeParcelas: 12, valor1aParcela: '127,53', valorDescontos: null },
      ],
    })
  })

  test('recusa com 400 vira mensagem para o cidadão', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/parcelamentos/simular`, () =>
        HttpResponse.json(
          { error: 'Não é possível parcelar CDA suspensa.' },
          { status: 400 }
        )
      )
    )

    expect(await getDalDividaAtivaSimulacao(CDAS, DATA, CPF)).toEqual({
      situacao: 'recusada',
      mensagem: 'Não é possível parcelar CDA suspensa.',
    })
  })

  test('recusa do DAM com 200 e mensagemErro também é recusa, não falha', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/parcelamentos/simular`, () =>
        HttpResponse.json(
          { mensagemErro: 'Valor insuficiente para parcelamento.', opcoes: [] },
          { status: 200 }
        )
      )
    )

    expect(await getDalDividaAtivaSimulacao(CDAS, DATA, CPF)).toEqual({
      situacao: 'recusada',
      mensagem: 'Valor insuficiente para parcelamento.',
    })
  })

  test('5xx é indisponibilidade, sem vazar a mensagem do sistema', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/divida-ativa/parcelamentos/simular`, () =>
        HttpResponse.json(
          { error: 'Falha ao consultar o ePortal' },
          { status: 503 }
        )
      )
    )

    expect(await getDalDividaAtivaSimulacao(CDAS, DATA, CPF)).toEqual({
      situacao: 'indisponivel',
    })
  })
})
