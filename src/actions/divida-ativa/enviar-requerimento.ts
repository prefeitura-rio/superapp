'use server'

import { postDividaAtivaRequerimentos } from '@/http-divida-ativa/divida-ativa-requerimentos/divida-ativa-requerimentos'
import { mapApiToMensagemErro } from '@/lib/divida-ativa-mappers'
import type { ResultadoAcaoDividaAtiva } from './resultado'

const ERRO_GENERICO =
  'Não foi possível enviar o requerimento agora. Tente novamente em alguns minutos.'

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
  /** Tipo do solicitante — vai em `descVinculoRequerente`. */
  descVinculoRequerente: string
  /** Documentos anexados (base64 inline). */
  documentos: DocumentoRequerimento[]
}

/**
 * Envia o requerimento de parcelamento ao DAM.
 *
 * Documentos chegam como base64 inline (`data:...;base64,...`) — o próprio campo da API.
 * Segundo a descrição do `DocumentoDamRequest`, a API remove o prefixo `data:...;base64,`
 * antes de repassar ao DAM.
 *
 * ⚠️ **Limite de Server Action:** Next.js tem limite de `bodySizeLimit` nas server actions
 * (padrão 1 MB). Com documentos base64 (base64 infla ~33%), dois arquivos de 500 KB já
 * chegam a ~1,33 MB. O `next.config.ts` deve ter `serverActions: { bodySizeLimit: '6mb' }`
 * para suportar o pior caso (4 documentos × 1,5 MB × 1,33 = ~8 MB). Ajustar conforme medição
 * real em produção.
 *
 * O campo `senha` não é enviado: a equipe da API ainda não confirmou se é obrigatório
 * e a premissa de segurança é não trafegar senha fora do IdP. Ver docs/divida-ativa.md
 * (seção "O passo de senha").
 *
 * `tipoAutenticacao` não é enviado pelo mesmo motivo — desconhecemos os valores aceitos.
 * `declaracaoAceita` é sempre `true`: o cidadão declarou ao clicar em "Enviar requerimento".
 */
export async function enviarRequerimento(
  dados: DadosRequerimento
): Promise<ResultadoAcaoDividaAtiva<{ protocolo: string }>> {
  if (dados.cdas.length === 0) {
    return {
      success: false,
      error: 'Selecione ao menos uma dívida para requerer o parcelamento.',
      status: 400,
    }
  }

  if (dados.documentos.length === 0) {
    return {
      success: false,
      error: 'Anexe ao menos um documento para enviar o requerimento.',
      status: 400,
    }
  }

  console.log(
    '[enviarRequerimento] chamando POST /divida-ativa/requerimentos',
    {
      cdas: dados.cdas,
      qtdeParcelas: dados.qtdeParcelas,
      dtVencimento: dados.dtVencimento,
      descVinculoRequerente: dados.descVinculoRequerente,
      documentos: dados.documentos.map(doc => ({
        tipo: doc.tipo,
        nomeArquivo: doc.nomeArquivo,
        tamanhoBase64: doc.conteudoBase64.length,
      })),
    }
  )

  const response = await postDividaAtivaRequerimentos(
    {
      cdas: dados.cdas,
      qtdeParcelas: dados.qtdeParcelas,
      dtVencimento: dados.dtVencimento,
      valor1aParcela: dados.valor1aParcela,
      descVinculoRequerente: dados.descVinculoRequerente,
      declaracaoAceita: true,
      documentos: dados.documentos.map(doc => ({
        tipo: doc.tipo,
        nomeArquivo: doc.nomeArquivo,
        conteudoBase64: doc.conteudoBase64,
      })),
    },
    { cache: 'no-store' }
  )

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

  return { success: true, data: { protocolo } }
}
