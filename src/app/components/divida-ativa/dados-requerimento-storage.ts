import type {
  DadosCorrespondencia,
  DadosRequerente,
} from './dados-requerimento-schema'

/**
 * Dados do requerente e de correspondência entre as etapas do requerimento.
 *
 * Ficam no `sessionStorage` e **não na URL**: telefone, e-mail, CPF/CNPJ e endereço são dados
 * pessoais, e query string acaba em log de servidor, de proxy e no histórico do navegador. A
 * aba fechada descarta tudo.
 *
 * Os anexos não ficam aqui: são grandes demais para a cota e só vivem em memória, no layout
 * do wizard (`documentos-requerimento-context`).
 */
export const CHAVE_DADOS_SESSION = 'divida-ativa:requerimento:dados'

interface DadosSalvos {
  requerente?: DadosRequerente
  correspondencia?: DadosCorrespondencia
}

function ler(): DadosSalvos {
  try {
    const raw = sessionStorage.getItem(CHAVE_DADOS_SESSION)
    return raw ? (JSON.parse(raw) as DadosSalvos) : {}
  } catch {
    return {}
  }
}

function gravar(dados: DadosSalvos) {
  try {
    sessionStorage.setItem(CHAVE_DADOS_SESSION, JSON.stringify(dados))
  } catch {
    // Armazenamento bloqueado: o cidadão segue, mas perde os dados ao voltar.
  }
}

export function lerDadosRequerente(): DadosRequerente | null {
  return ler().requerente ?? null
}

export function salvarDadosRequerente(requerente: DadosRequerente) {
  gravar({ ...ler(), requerente })
}

export function lerDadosCorrespondencia(): DadosCorrespondencia | null {
  return ler().correspondencia ?? null
}

export function salvarDadosCorrespondencia(
  correspondencia: DadosCorrespondencia
) {
  gravar({ ...ler(), correspondencia })
}

/** Descarta os dados — depois do envio, para o próximo requerimento começar do perfil. */
export function limparDadosRequerimento() {
  try {
    sessionStorage.removeItem(CHAVE_DADOS_SESSION)
  } catch {
    // Armazenamento bloqueado: não há o que limpar.
  }
}
