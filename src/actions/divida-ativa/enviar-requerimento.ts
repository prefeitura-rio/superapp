'use server'

import {
  type DadosCorrespondencia,
  type DadosRequerente,
  dadosCorrespondenciaSchema,
  dadosRequerenteSchema,
  paraApi,
} from '@/app/components/divida-ativa/dados-requerimento-schema'
import {
  FORMATOS_PERMITIDOS,
  MAXIMO_DOCUMENTOS,
  extensaoPermitida,
  isTipoDocumento,
  limiteDoTipo,
} from '@/app/components/divida-ativa/documentos-requerimento-regras'
import {
  CODIGO_VINCULO_DAM,
  type TipoSolicitante,
  isTipoSolicitante,
} from '@/app/components/divida-ativa/tipos-solicitante'
import { postDividaAtivaRequerimentos } from '@/http-divida-ativa/divida-ativa-requerimentos/divida-ativa-requerimentos'
import { getDalDividaAtivaSimulacao } from '@/lib/dal'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import { getUserInfoFromToken } from '@/lib/user-info'
import { headers } from 'next/headers'
import type { ResultadoAcaoDividaAtiva } from './resultado'

const ERRO_GENERICO =
  'Não foi possível enviar o requerimento agora. Tente novamente em alguns minutos.'

const ERRO_DOCUMENTOS =
  'Não conseguimos conferir os documentos anexados. Volte à etapa de documentos e anexe-os de novo.'

const ERRO_PARCELAS =
  'As condições do parcelamento mudaram. Volte à simulação e escolha as parcelas de novo.'

/**
 * Falha sem resposta (rede, timeout): o DAM pode ter recebido o pedido mesmo assim. Reenviar às
 * cegas criaria um segundo requerimento — o cidadão confere antes.
 */
const ERRO_SEM_RESPOSTA =
  'Não conseguimos confirmar o envio. Antes de tentar de novo, confira em "Acompanhar requerimento" se o pedido já foi registrado.'

const ERRO_DADOS =
  'Confira seus dados e o endereço de correspondência antes de enviar.'

interface DocumentoRequerimento {
  tipo: string
  nomeArquivo: string
  conteudoBase64: string
}

interface DadosRequerimento {
  /** IDs das CDAs selecionadas. */
  cdas: string[]
  /**
   * Quantidade de parcelas escolhida (número como string, exigência da API). Só escolhe a
   * opção: o valor da 1ª parcela sai da simulação que a action refaz.
   */
  qtdeParcelas: string
  /** Data de vencimento da primeira parcela no formato `dd/MM/yyyy`. */
  dtVencimento: string
  /** Vínculo do solicitante; vai em `descVinculoRequerente` pelo código legado do DAM. */
  tipo: TipoSolicitante
  /** Telefone e e-mail do requerente, como o formulário os guarda (mascarados). */
  requerente: DadosRequerente
  /** Endereço de correspondência, como o formulário o guarda (mascarado). */
  correspondencia: DadosCorrespondencia
  /** Documentos anexados (base64 inline). */
  documentos: DocumentoRequerimento[]
  /** O cidadão marcou a declaração de autenticidade dos documentos e informações. */
  declaracaoAceita: boolean
}

export interface RequerimentoEnviado {
  protocolo: string
  /** Data até a qual a PGM responde (`datPrevisaoEntrega`), quando o DAM a informa. */
  prazo: string | null
}

/**
 * IP do cidadão, para o rastro do requerimento (RN-038). A API o lê de `X-Forwarded-For`; sem
 * repassá-lo, ela registraria o IP do servidor Next, que é quem a chama.
 *
 * O **primeiro** valor do `X-Forwarded-For` é o que o cliente quiser declarar — o Envoy só
 * acrescenta hops à direita. Vale o que o mesh viu: `x-envoy-external-address`, que o Istio
 * grava a partir da conexão; sem ele, o último hop, acrescentado pelo próprio ingress.
 */
async function ipDoCidadao(): Promise<string | null> {
  const cabecalhos = await headers()

  const doMesh = cabecalhos.get('x-envoy-external-address')?.trim()
  if (doMesh) return doMesh

  const ultimoHop = cabecalhos.get('x-forwarded-for')?.split(',').pop()?.trim()
  return ultimoHop || null
}

/** `data:<mime>;base64,` do FileReader; a API também o remove antes de mandar ao DAM. */
const PREFIXO_DATA_URI = /^data:[\w.+-]+\/[\w.+-]+;base64,/
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/

/** Tamanho em bytes do arquivo que o base64 representa; `null` se ele não decodifica. */
function bytesDoBase64(conteudo: string): number | null {
  const base64 = conteudo.replace(PREFIXO_DATA_URI, '')
  if (base64.length % 4 !== 0 || !BASE64.test(base64)) return null

  return Buffer.from(base64, 'base64').length
}

/**
 * Confere os anexos com as regras do contrato — as mesmas da tela, que o cliente pode ter
 * contornado. Devolve a mensagem para o cidadão, ou `null` se estiverem em ordem.
 *
 * O tamanho vale para o arquivo **decodificado**, como o cidadão o vê no computador: o base64
 * de um arquivo de 500 KB tem ~667 KB.
 */
function erroDosDocumentos(documentos: DocumentoRequerimento[]): string | null {
  if (documentos.length === 0) {
    return 'Anexe ao menos um documento para enviar o requerimento.'
  }
  if (documentos.length > MAXIMO_DOCUMENTOS) return ERRO_DOCUMENTOS

  const tipos = new Set<string>()
  for (const doc of documentos) {
    if (!isTipoDocumento(doc.tipo) || tipos.has(doc.tipo)) {
      return ERRO_DOCUMENTOS
    }
    tipos.add(doc.tipo)

    if (!extensaoPermitida(doc.nomeArquivo)) {
      return `O arquivo "${doc.nomeArquivo}" precisa estar em formato ${FORMATOS_PERMITIDOS}.`
    }

    const bytes = bytesDoBase64(doc.conteudoBase64)
    if (!bytes) return ERRO_DOCUMENTOS

    if (bytes > limiteDoTipo(doc.tipo)) {
      return `O arquivo "${doc.nomeArquivo}" passa do tamanho permitido para este documento.`
    }
  }

  return null
}

/**
 * Envia o requerimento de parcelamento ao DAM.
 *
 * Documentos chegam como base64 inline (`data:...;base64,...`) — o próprio campo da API.
 * Segundo a descrição do `DocumentoDamRequest`, a API remove o prefixo `data:...;base64,`
 * antes de repassar ao DAM.
 *
 * ### Dados do requerente e de correspondência
 *
 * Revalidados aqui com os mesmos schemas dos formulários — o que vem do cliente não é
 * confiável. O **nome do requerente vem do token**, não do corpo: o requerimento é sempre de
 * quem está autenticado (a API também lê o CPF do token). As máscaras saem em `paraApi`.
 *
 * ### Documentos
 *
 * Revalidados aqui antes do POST (`erroDosDocumentos`): tipo no enum do contrato, um arquivo
 * por tipo, extensão aceita pela API e tamanho do arquivo decodificado dentro do limite do
 * tipo. A tela faz as mesmas contas com as mesmas regras (`documentos-requerimento-regras`).
 *
 * ⚠️ **Limite de Server Action:** o `bodySizeLimit` do `next.config.ts` está em 10 MB. O pior
 * caso é o procurador de pessoa jurídica: 8 arquivos (3 de 1,5 MB e 5 de 500 KB) somam 7 MB,
 * ~9,3 MB em base64 — cabe, mas com pouca folga. Mudar limites ou slots exige rever o config.
 *
 * ### Valores do parcelamento
 *
 * Do cliente só valem as escolhas: CDAs, data e quantidade de parcelas. O valor da 1ª parcela
 * sai de uma simulação refeita aqui, com as mesmas CDAs e data — o DAM grava o que recebe, e
 * um valor editado no navegador não pode chegar a ele. Quantidade que a simulação não oferece
 * é recusada.
 *
 * ### Declaração, sem senha
 *
 * `declaracaoAceita` é o checkbox que o cidadão marcou; sem ele, nem chamamos a API. A
 * reautenticação por senha na conta Identidade Carioca saiu do fluxo em 20/10/2026 — o cidadão
 * já está autenticado pelo Keycloak. A `api-imoveis` acompanhou (MR 9): o contrato não tem
 * mais o campo `senha` nem `POST /divida-ativa/validar-senha`, e o cliente Orval foi
 * regenerado do swagger dessa versão.
 */
export async function enviarRequerimento(
  dados: DadosRequerimento
): Promise<ResultadoAcaoDividaAtiva<RequerimentoEnviado>> {
  const { cpf, name } = await getUserInfoFromToken()

  if (!cpf) {
    return { success: false, error: 'Usuário não autenticado', status: 401 }
  }

  if (dados.cdas.length === 0) {
    return {
      success: false,
      error: 'Selecione ao menos uma dívida para requerer o parcelamento.',
      status: 400,
    }
  }

  if (!dados.declaracaoAceita) {
    return {
      success: false,
      error: 'Marque a declaração para enviar o requerimento.',
      status: 400,
    }
  }

  if (!isTipoSolicitante(dados.tipo)) {
    return {
      success: false,
      error: 'Escolha o tipo de vínculo antes de enviar.',
      status: 400,
    }
  }

  const requerente = dadosRequerenteSchema.safeParse(dados.requerente)
  const correspondencia = dadosCorrespondenciaSchema.safeParse(
    dados.correspondencia
  )
  if (!requerente.success || !correspondencia.success) {
    return { success: false, error: ERRO_DADOS, status: 400 }
  }

  const erroDocumentos = erroDosDocumentos(dados.documentos)
  if (erroDocumentos) {
    return { success: false, error: erroDocumentos, status: 400 }
  }

  // Por último entre as conferências: atravessa o ePortal.
  const simulacao = await getDalDividaAtivaSimulacao(
    dados.cdas,
    dados.dtVencimento,
    cpf
  )
  if (simulacao.situacao === 'recusada') {
    return { success: false, error: simulacao.mensagem, status: 422 }
  }
  if (simulacao.situacao === 'indisponivel') {
    return { success: false, error: ERRO_GENERICO, status: 503 }
  }

  const opcao = simulacao.opcoes.find(
    o => String(o.qtdeParcelas) === dados.qtdeParcelas
  )
  if (!opcao) {
    return { success: false, error: ERRO_PARCELAS, status: 400 }
  }

  const ip = await ipDoCidadao()

  let response: Awaited<ReturnType<typeof postDividaAtivaRequerimentos>>
  try {
    response = await postDividaAtivaRequerimentos(
      {
        cdas: dados.cdas,
        qtdeParcelas: String(opcao.qtdeParcelas),
        dtVencimento: dados.dtVencimento,
        valor1aParcela:
          opcao.valor1aParcela === null
            ? undefined
            : String(opcao.valor1aParcela),
        descVinculoRequerente: CODIGO_VINCULO_DAM[dados.tipo],
        nomRequerente: name || undefined,
        ...paraApi(requerente.data, correspondencia.data),
        declaracaoAceita: true,
        documentos: dados.documentos.map(doc => ({
          tipo: doc.tipo,
          nomeArquivo: doc.nomeArquivo,
          conteudoBase64: doc.conteudoBase64,
        })),
      },
      {
        cache: 'no-store',
        ...(ip && { headers: { 'X-Forwarded-For': ip } }),
      }
    )
  } catch {
    return { success: false, error: ERRO_SEM_RESPOSTA, status: 504 }
  }

  if (response.status !== 201) {
    return {
      success: false,
      error:
        mapApiToMensagemErro(response.data, response.status) ?? ERRO_GENERICO,
      status: response.status,
    }
  }

  // O protocolo do requerimento é `numProtocoloRequerimentoParcelamento` no contrato.
  // `mensagemErro` com 201 é padrão do DAM para recusa soft — tratar como falha.
  if (response.data?.mensagemErro) {
    return {
      success: false,
      error: response.data.mensagemErro,
      status: 422,
    }
  }

  const protocolo = response.data?.numProtocoloRequerimentoParcelamento
  if (!protocolo) {
    return {
      success: false,
      error: ERRO_GENERICO,
      status: 502,
    }
  }

  return {
    success: true,
    data: {
      protocolo,
      prazo: response.data?.datPrevisaoEntrega || null,
      // Sem `urlComprovante`: ela pode levar token e iria para a URL da confirmação, que o
      // busca no servidor pelo protocolo (`ComprovanteRequerimento`).
    },
  }
}
