'use server'

import {
  type DadosCorrespondencia,
  type DadosRequerente,
  dadosCorrespondenciaSchema,
  dadosRequerenteSchema,
  paraApi,
} from '@/app/components/divida-ativa/dados-requerimento-schema'
import {
  CODIGO_VINCULO_DAM,
  type TipoSolicitante,
  isTipoSolicitante,
} from '@/app/components/divida-ativa/tipos-solicitante'
import { postDividaAtivaRequerimentos } from '@/http-divida-ativa/divida-ativa-requerimentos/divida-ativa-requerimentos'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import { getUserInfoFromToken } from '@/lib/user-info'
import { headers } from 'next/headers'
import type { ResultadoAcaoDividaAtiva } from './resultado'

const ERRO_GENERICO =
  'Não foi possível enviar o requerimento agora. Tente novamente em alguns minutos.'

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
  /** Quantidade de parcelas escolhida (número como string, exigência da API). */
  qtdeParcelas: string
  /** Data de vencimento da primeira parcela no formato `dd/MM/yyyy`. */
  dtVencimento: string
  /** Valor da 1ª parcela (string formatada). */
  valor1aParcela?: string
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
  /** PDF do comprovante no DAM, quando já disponível. */
  urlComprovante: string | null
}

/**
 * IP do cidadão, para o rastro do requerimento (RN-038). A API o lê de `X-Forwarded-For`; sem
 * repassá-lo, ela registraria o IP do servidor Next, que é quem a chama.
 */
async function ipDoCidadao(): Promise<string | null> {
  const cabecalhos = await headers()
  const encaminhado = cabecalhos.get('x-forwarded-for')?.split(',')[0]?.trim()

  return encaminhado || cabecalhos.get('x-real-ip')?.trim() || null
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
 * ⚠️ **Limite de Server Action:** Next.js tem limite de `bodySizeLimit` nas server actions
 * (padrão 1 MB). Com documentos base64 (base64 infla ~33%), dois arquivos de 500 KB já
 * chegam a ~1,33 MB. O `next.config.ts` deve ter `serverActions: { bodySizeLimit: '6mb' }`
 * para suportar o pior caso (4 documentos × 1,5 MB × 1,33 = ~8 MB). Ajustar conforme medição
 * real em produção.
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

  if (dados.documentos.length === 0) {
    return {
      success: false,
      error: 'Anexe ao menos um documento para enviar o requerimento.',
      status: 400,
    }
  }

  const ip = await ipDoCidadao()

  let response: Awaited<ReturnType<typeof postDividaAtivaRequerimentos>>
  try {
    response = await postDividaAtivaRequerimentos(
      {
        cdas: dados.cdas,
        qtdeParcelas: dados.qtdeParcelas,
        dtVencimento: dados.dtVencimento,
        valor1aParcela: dados.valor1aParcela,
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
      urlComprovante: response.data?.urlComprovante || null,
    },
  }
}
