'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { UploadIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { TipoSolicitante } from './escolha-tipo-solicitante'

/** Um arquivo já carregado pelo cidadão. */
interface ArquivoAnexado {
  /** `tipo` do `DocumentoDamRequest` — o que a API espera (ex.: `"IDENTIDADE"`). */
  tipo: string
  nomeArquivo: string
  conteudoBase64: string
  /** Tamanho em bytes do arquivo original — para exibir e validar. */
  tamanho: number
}

/** Definição de um slot de upload mostrado na tela. */
interface SlotDocumento {
  /** Identificador único dentro desta tela. */
  tipo: string
  titulo: string
  descricao: string | null
  /**
   * Limite de tamanho em bytes.
   *
   * Segundo o Figma: Identidade, CPF e CNPJ → 500 KB; demais → 1,5 MB.
   */
  limiteBytes: number
  /** Quando `true`, o slot não bloqueia o "Revisar envio". */
  opcional: boolean
}

const KB = 1024
const MB = 1024 * KB

const LIMITE_IDENTIDADE_CPF_CNPJ = 500 * KB
const LIMITE_GERAL = 1.5 * MB

/** Slots por tipo de solicitante. */
const SLOTS_POR_TIPO: Record<TipoSolicitante, SlotDocumento[]> = {
  PESSOA_FISICA: [
    {
      tipo: 'IDENTIDADE',
      titulo: 'Identidade do requerente com foto',
      descricao: null,
      limiteBytes: LIMITE_IDENTIDADE_CPF_CNPJ,
      opcional: false,
    },
    {
      tipo: 'CPF',
      titulo: 'CPF do requerente',
      descricao: null,
      limiteBytes: LIMITE_IDENTIDADE_CPF_CNPJ,
      opcional: false,
    },
    {
      tipo: 'OUTROS',
      titulo: 'Outros documentos',
      descricao:
        'Envie documentos adicionais que possam ajudar a comprovar benefícios a que você tem direito.',
      limiteBytes: LIMITE_GERAL,
      opcional: true,
    },
  ],

  PESSOA_JURIDICA: [
    {
      tipo: 'CNPJ',
      titulo: 'CNPJ da empresa',
      descricao: null,
      limiteBytes: LIMITE_IDENTIDADE_CPF_CNPJ,
      opcional: false,
    },
    {
      tipo: 'CONTRATO_SOCIAL',
      titulo: 'Registro de empresário individual, contrato ou estatuto social',
      descricao: 'Última alteração consolidada',
      limiteBytes: LIMITE_GERAL,
      opcional: false,
    },
    {
      tipo: 'OUTROS',
      titulo: 'Outros documentos',
      descricao:
        'Envie documentos adicionais que possam ajudar a comprovar benefícios a que você tem direito.',
      limiteBytes: LIMITE_GERAL,
      opcional: true,
    },
  ],

  SOCIEDADE_ANONIMA: [
    {
      tipo: 'ATA_ELEICAO',
      titulo: 'Ata de eleição da atual diretoria',
      descricao: null,
      limiteBytes: LIMITE_GERAL,
      opcional: false,
    },
    {
      tipo: 'OUTROS',
      titulo: 'Outros documentos',
      descricao:
        'Envie documentos adicionais que possam ajudar a comprovar benefícios a que você tem direito.',
      limiteBytes: LIMITE_GERAL,
      opcional: true,
    },
  ],

  PROCURADOR: [
    {
      tipo: 'PROCURACAO',
      titulo: 'Procuração com firma reconhecida',
      descricao: null,
      limiteBytes: LIMITE_GERAL,
      opcional: false,
    },
    {
      tipo: 'IDENTIDADE_OUTORGANTE',
      titulo: 'Identidade do Outorgante com foto',
      descricao: null,
      limiteBytes: LIMITE_IDENTIDADE_CPF_CNPJ,
      opcional: false,
    },
    {
      tipo: 'CPF_OUTORGANTE',
      titulo: 'CPF do Outorgante',
      descricao: null,
      limiteBytes: LIMITE_IDENTIDADE_CPF_CNPJ,
      opcional: false,
    },
    {
      tipo: 'OUTROS',
      titulo: 'Outros documentos',
      descricao:
        'Envie documentos adicionais que possam ajudar a comprovar benefícios a que você tem direito.',
      limiteBytes: LIMITE_GERAL,
      opcional: true,
    },
  ],

  OUTRO: [
    {
      tipo: 'DOCUMENTOS_POSSE',
      titulo: 'Documentos',
      descricao:
        'Registro de Imóveis, Compra e Venda ou promessa, Sentença Judicial, Termo de Inventariança, Auto de Arrematação ou Petição Inicial de Usucapião, ou documento comprovando a posse com ânimo de dono.',
      limiteBytes: LIMITE_GERAL,
      opcional: false,
    },
    {
      tipo: 'OUTROS',
      titulo: 'Outros documentos',
      descricao:
        'Envie documentos adicionais que possam ajudar a comprovar benefícios a que você tem direito.',
      limiteBytes: LIMITE_GERAL,
      opcional: true,
    },
  ],
}

const TITULO_POR_TIPO: Record<TipoSolicitante, string> = {
  PESSOA_FISICA: 'Pessoa Física',
  PESSOA_JURIDICA: 'Pessoa Jurídica',
  SOCIEDADE_ANONIMA: 'Sociedade Anônima',
  PROCURADOR: 'Procurador',
  OUTRO: '',
}

/** Descrição do painel de instruções por tipo (texto do Figma). */
const INSTRUCOES_POR_TIPO: Record<TipoSolicitante, string> = {
  PESSOA_FISICA:
    'Os arquivos devem estar em formato PDF ou JPG. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB. Se a sua identidade tiver o número de CPF, você não precisa anexá-lo.',
  PESSOA_JURIDICA:
    'Os arquivos devem estar em formato PDF ou JPG. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB.',
  SOCIEDADE_ANONIMA:
    'Os arquivos devem estar em formato PDF ou JPG. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB.',
  PROCURADOR:
    'Os arquivos devem estar em formato PDF ou JPG. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB.',
  OUTRO:
    'Os arquivos devem estar em formato PDF ou JPG. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB.',
}

/** Formata bytes para exibição amigável. */
function formatarTamanho(bytes: number): string {
  if (bytes < KB) return `${bytes} B`
  if (bytes < MB) return `${(bytes / KB).toFixed(0)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

interface SlotUploadProps {
  slot: SlotDocumento
  arquivo: ArquivoAnexado | null
  onArquivo: (arquivo: ArquivoAnexado | null) => void
}

/**
 * Um card de upload — ícone de upload, título, descrição, estado do arquivo e botão de remover.
 *
 * O `input[type=file]` real fica `sr-only`; o clique no card o ativa via `ref`. Assim o
 * estilo do card não depende do estilo nativo do input.
 */
function SlotUpload({ slot, arquivo, onArquivo }: SlotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)

  function abrirSeletor() {
    setErro(null)
    inputRef.current?.click()
  }

  function remover(e: React.MouseEvent) {
    e.stopPropagation()
    setErro(null)
    onArquivo(null)
    // Limpa o input para permitir reenvio do mesmo arquivo.
    if (inputRef.current) inputRef.current.value = ''
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Valida tipo
    const tipoPermitido =
      file.type === 'application/pdf' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif'
    if (!tipoPermitido) {
      setErro('Formato inválido. Envie um arquivo PDF, JPG ou GIF.')
      return
    }

    // Valida tamanho
    if (file.size > slot.limiteBytes) {
      setErro(
        `O arquivo é muito grande. O limite para este documento é ${formatarTamanho(slot.limiteBytes)}.`
      )
      return
    }

    // Lê como base64
    const reader = new FileReader()
    reader.onload = () => {
      onArquivo({
        tipo: slot.tipo,
        nomeArquivo: file.name,
        conteudoBase64: reader.result as string,
        tamanho: file.size,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Card + botão de remover ficam lado a lado no mesmo row — nunca aninhados,
          pois <button> dentro de <button> é HTML inválido e causa hydration error. */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={abrirSeletor}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary"
          aria-label={
            arquivo ? `${slot.titulo} — ${arquivo.nomeArquivo}` : slot.titulo
          }
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
            <UploadIcon className="size-5 text-foreground" aria-hidden />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium leading-5 text-foreground">
              {slot.titulo}
            </span>
            {slot.descricao && !arquivo && (
              <span className="text-xs font-normal leading-4 text-foreground-light">
                {slot.descricao}
              </span>
            )}
            {arquivo && (
              <span className="truncate text-xs font-normal leading-4 text-foreground-light">
                {arquivo.nomeArquivo} · {formatarTamanho(arquivo.tamanho)}
              </span>
            )}
          </span>

          {!arquivo && (
            <span
              className="text-sm font-normal leading-5 text-foreground-light"
              aria-hidden
            >
              &rsaquo;
            </span>
          )}
        </button>

        {arquivo && (
          <button
            type="button"
            onClick={remover}
            aria-label={`Remover ${slot.titulo}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card hover:bg-secondary"
          >
            <XIcon className="size-4 text-foreground-light" aria-hidden />
          </button>
        )}
      </div>

      {/* Input real, invisível. */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif,application/pdf"
        onChange={onFileChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      {erro && (
        <p
          role="alert"
          className="px-4 text-xs font-normal leading-4 text-destructive"
        >
          {erro}
        </p>
      )}
    </div>
  )
}

interface AnexarDocumentosProps {
  tipo: TipoSolicitante
  /** Parâmetros correntes da URL, incluindo `?tipo=`. */
  searchParamsAtual: Record<string, string>
}

/**
 * "Anexe os documentos necessários" — segunda etapa do requerimento.
 *
 * A lista de slots muda por tipo de solicitante; tudo mais (estado, validação, serialização)
 * é igual. O "Revisar envio" só libera quando todos os slots obrigatórios têm arquivo.
 *
 * Os documentos são serializados como JSON + encodeURIComponent em `?documentos=` para
 * chegarem à etapa de revisão — não há server action aqui, só navegação client-side. O
 * base64 pode inflar a URL, mas documentos pequenos (≤ 1,5 MB → base64 ≤ ~2 MB) ficam dentro
 * do limite prático dos navegadores modernos (~2 MB de URL).
 *
 * ⚠️ **Limitação conhecida:** URLs com base64 de arquivos grandes podem ser bloqueadas por
 * proxies. Se isso se tornar problema em produção, substituir pela sessão do servidor ou
 * por `sessionStorage` — mas primeiro medir, não otimizar antecipadamente.
 *
 * Client Component: manipulação de arquivos (FileReader, input[type=file]).
 */
export function AnexarDocumentos({
  tipo,
  searchParamsAtual,
}: AnexarDocumentosProps) {
  const router = useRouter()
  const slots = SLOTS_POR_TIPO[tipo]
  const titulo = TITULO_POR_TIPO[tipo]
  const instrucoes = INSTRUCOES_POR_TIPO[tipo]

  // Estado: um arquivo por slot (null = não enviado).
  const [arquivos, setArquivos] = useState<
    Record<string, ArquivoAnexado | null>
  >(() => Object.fromEntries(slots.map(s => [s.tipo, null])))

  function setArquivo(tipoSlot: string) {
    return (arquivo: ArquivoAnexado | null) => {
      setArquivos(prev => ({ ...prev, [tipoSlot]: arquivo }))
    }
  }

  const obrigatoriosPreenchidos = slots
    .filter(s => !s.opcional)
    .every(s => arquivos[s.tipo] !== null)

  function revisarEnvio() {
    const docs = slots
      .map(s => arquivos[s.tipo])
      .filter((a): a is ArquivoAnexado => a !== null)

    // Documentos ficam no sessionStorage — não na URL — para evitar HTTP 431
    // (Request Header Fields Too Large) causado por base64 nos query params.
    // A chave é fixa: só um requerimento pode estar em andamento por vez na aba.
    sessionStorage.setItem(
      'divida-ativa:requerimento:documentos',
      JSON.stringify(docs)
    )

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('etapa', 'revisao')
    // `?documentos=` removido da URL de propósito — os dados estão no sessionStorage.
    destino.delete('documentos')

    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
        {titulo
          ? `Anexe os documentos necessários para ${titulo}`
          : 'Anexe os documentos necessários'}
      </h1>

      <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
        {instrucoes}
      </p>

      <div className="flex flex-col gap-2">
        {slots.map(slot => (
          <SlotUpload
            key={slot.tipo}
            slot={slot}
            arquivo={arquivos[slot.tipo]}
            onArquivo={setArquivo(slot.tipo)}
          />
        ))}
      </div>

      <div className="mt-auto pt-6 pb-2">
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!obrigatoriosPreenchidos}
          onClick={revisarEnvio}
        >
          Revisar envio
        </CustomButton>
      </div>
    </div>
  )
}
