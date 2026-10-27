'use client'

import { ChevronRightIcon, XIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { TipoDocumentoDam } from '@/http-divida-ativa/models'
import { UploadIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  type ArquivoAnexado,
  useDocumentosRequerimento,
} from './documentos-requerimento-context'
import {
  FORMATOS_PERMITIDOS,
  extensaoPermitida,
  limiteDoTipo,
} from './documentos-requerimento-regras'
import type { TipoSolicitante } from './tipos-solicitante'

/** Definição de um slot de upload mostrado na tela. */
interface SlotDocumento {
  /** Tipo do contrato; identifica o slot e define o limite (`limiteDoTipo`). */
  tipo: TipoDocumentoDam
  titulo: string
  descricao: string | null
  /** Quando `true`, o slot não bloqueia o "Revisar envio". */
  opcional: boolean
}

const KB = 1024
const MB = 1024 * KB

/** Tipos MIME dos formatos do contrato; a extensão também é conferida. */
const MIME_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
]

/** Slot comum a todos os vínculos: documentos extras, nunca obrigatórios. */
const SLOT_OUTROS: SlotDocumento = {
  tipo: 'OUTROS',
  titulo: 'Outros documentos',
  descricao:
    'Envie documentos adicionais que possam ajudar a comprovar benefícios a que você tem direito.',
  opcional: true,
}

/**
 * Identidade e CPF de quem faz o pedido — obrigatórios em **todos** os vínculos, como no
 * portal legado ("Obrigatórios – Requerente"). Só o rótulo muda: `quem` nomeia o requerente
 * no vínculo escolhido (vazio quando é o próprio contribuinte).
 */
function slotsDoRequerente(quem: string): SlotDocumento[] {
  return [
    {
      tipo: 'IDENTIDADE',
      titulo: `Identidade${quem} com foto`,
      descricao: null,
      opcional: false,
    },
    {
      tipo: 'CPF',
      titulo: `CPF${quem}`,
      descricao: null,
      opcional: false,
    },
  ]
}

/**
 * Slots por vínculo do solicitante.
 *
 * O portal legado mostra todos os campos numa tela só, em grupos ("Obrigatórios –
 * Requerente", "caso devedor seja pessoa jurídica", "caso sociedade anônima", "caso
 * procurador", "quando atual proprietário é diferente do constante na CDA", "outros"). Aqui
 * o vínculo é escolhido antes, e cada um recebe os grupos que se aplicam a ele:
 *
 * - todos: identidade e CPF do requerente, e outros documentos (opcional);
 * - sócio responsável: + CNPJ e contrato/estatuto social; a ata de eleição só é exigida de
 *   sociedade anônima, por isso fica opcional, com a condição na descrição;
 * - procurador: + procuração, identidade e CPF do outorgante;
 * - atual proprietário/possuidor: + comprovante de propriedade ou posse.
 */
/** CNPJ e registro/contrato social — "Obrigatórios, caso devedor seja pessoa jurídica". */
const SLOTS_EMPRESA: SlotDocumento[] = [
  {
    tipo: 'CNPJ',
    titulo: 'CNPJ da empresa',
    descricao: null,
    opcional: false,
  },
  {
    tipo: 'REGISTRO_EMPRESA',
    titulo: 'Registro de empresário individual, contrato ou estatuto social',
    descricao: 'Última alteração consolidada',
    opcional: false,
  },
]

const SLOTS_POR_TIPO: Record<TipoSolicitante, SlotDocumento[]> = {
  CONTRIBUINTE: [...slotsDoRequerente(''), SLOT_OUTROS],

  SOCIO_RESPONSAVEL: [
    ...slotsDoRequerente(' do sócio'),
    ...SLOTS_EMPRESA,
    {
      tipo: 'ATA',
      titulo: 'Ata de eleição da atual diretoria',
      descricao: 'Obrigatória se a empresa for sociedade anônima',
      opcional: true,
    },
    SLOT_OUTROS,
  ],

  PROCURADOR: [
    ...slotsDoRequerente(' do procurador'),
    {
      tipo: 'PROCURACAO',
      titulo: 'Procuração com firma reconhecida',
      descricao: null,
      opcional: false,
    },
    {
      tipo: 'IDENTIDADE_OUTORGANTE',
      titulo: 'Identidade do outorgante com foto',
      descricao: 'De quem concedeu a procuração',
      opcional: false,
    },
    {
      tipo: 'CPF_OUTORGANTE',
      titulo: 'CPF do outorgante',
      descricao: null,
      opcional: false,
    },
    SLOT_OUTROS,
  ],

  PROPRIETARIO_POSSUIDOR: [
    ...slotsDoRequerente(''),
    {
      tipo: 'ESCRITURA',
      titulo: 'Comprovante de propriedade ou posse',
      descricao:
        'Registro de Imóveis, Compra e Venda ou promessa, Sentença Judicial, Termo de Inventariança, Auto de Arrematação ou Petição Inicial de Usucapião, ou documento comprovando a posse com ânimo de dono.',
      opcional: false,
    },
    SLOT_OUTROS,
  ],
}

/** Vínculos que já pedem os documentos da empresa, ou que a API dispensa deles (5). */
const SEM_SLOTS_EMPRESA_EXTRAS: TipoSolicitante[] = [
  'SOCIO_RESPONSAVEL',
  'PROPRIETARIO_POSSUIDOR',
]

/**
 * Slots do vínculo, com os documentos da empresa quando o devedor é pessoa jurídica.
 *
 * Regra da API (`validarDocumentos`): CDA de pessoa jurídica exige CNPJ e registro de todo
 * vínculo, exceto do atual proprietário/possuidor. O sócio já os tem na lista; contribuinte e
 * procurador os ganham antes de "Outros documentos".
 */
export function slotsDoVinculo(
  tipo: TipoSolicitante,
  devedorPessoaJuridica: boolean
): SlotDocumento[] {
  const slots = SLOTS_POR_TIPO[tipo]
  if (!devedorPessoaJuridica || SEM_SLOTS_EMPRESA_EXTRAS.includes(tipo)) {
    return slots
  }

  return [
    ...slots.filter(slot => slot !== SLOT_OUTROS),
    ...SLOTS_EMPRESA,
    SLOT_OUTROS,
  ]
}

/** Complemento do título: "Anexe os documentos {do contribuinte}". */
const TITULO_POR_TIPO: Record<TipoSolicitante, string> = {
  CONTRIBUINTE: 'do contribuinte',
  SOCIO_RESPONSAVEL: 'do sócio responsável',
  PROCURADOR: 'do procurador',
  PROPRIETARIO_POSSUIDOR: 'do proprietário ou possuidor',
}

/**
 * Instruções abaixo do título. Os formatos são os do contrato da API — o portal legado dizia
 * só "PDF ou JPG", mas a API (e esta tela) aceitam também PNG e GIF.
 */
const INSTRUCOES = `Os arquivos devem estar em formato ${FORMATOS_PERMITIDOS}. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB.`

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
 * O card tem sempre o mesmo tamanho, com ou sem arquivo: o que muda é o canto direito, que
 * mostra o chevron (sem arquivo) ou o "X" de remover (com arquivo), na mesma posição.
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

    // Tipo e extensão: a API monta o nome do arquivo no DAM pela extensão.
    if (!MIME_PERMITIDOS.includes(file.type) || !extensaoPermitida(file.name)) {
      setErro(`Formato inválido. Envie um arquivo ${FORMATOS_PERMITIDOS}.`)
      return
    }

    const limite = limiteDoTipo(slot.tipo)
    if (file.size > limite) {
      setErro(
        `O arquivo é muito grande. O limite para este documento é ${formatarTamanho(limite)}.`
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
      {/* O botão de remover é irmão do card, posicionado sobre o canto direito (onde fica o
          chevron) — nunca aninhado, pois <button> dentro de <button> é HTML inválido e causa
          hydration error. */}
      <div className="relative">
        <button
          type="button"
          onClick={abrirSeletor}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary"
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

          {/* Reserva o espaço do chevron também com arquivo: é onde o "X" fica. */}
          <span
            className="flex size-10 shrink-0 items-center justify-center"
            aria-hidden
          >
            {!arquivo && (
              <ChevronRightIcon className="size-5 text-foreground-light" />
            )}
          </span>
        </button>

        {arquivo && (
          <button
            type="button"
            onClick={remover}
            aria-label={`Remover ${slot.titulo}`}
            className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-foreground-light transition-colors hover:bg-secondary hover:text-foreground"
          >
            <XIcon className="size-5" aria-hidden />
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
  /** Alguma CDA escolhida é de pessoa jurídica (`?pj=1`): pede CNPJ e registro da empresa. */
  devedorPessoaJuridica?: boolean
  /** Parâmetros correntes da URL, incluindo `?tipo=`. */
  searchParamsAtual: Record<string, string>
}

/**
 * "Anexe os documentos necessários" — segunda etapa do requerimento.
 *
 * A lista de slots muda por vínculo do solicitante; tudo mais (estado, validação, serialização)
 * é igual. O "Revisar envio" só libera quando todos os slots obrigatórios têm arquivo.
 *
 * Os documentos ficam em memória, no layout do wizard (`useDocumentosRequerimento`), para
 * chegarem à etapa de revisão — não há server action aqui, só navegação client-side. Eles
 * são salvos a cada anexo ou remoção, e não só no "Revisar envio": quem volta da revisão, ou
 * vai até a escolha do tipo e retorna com o mesmo tipo, reencontra os arquivos. Sair do
 * fluxo os descarta.
 *
 * Client Component: manipulação de arquivos (FileReader, input[type=file]).
 */
export function AnexarDocumentos({
  tipo,
  devedorPessoaJuridica = false,
  searchParamsAtual,
}: AnexarDocumentosProps) {
  const router = useRouter()
  const { lerDocumentos, salvarDocumentos } = useDocumentosRequerimento()
  const slots = slotsDoVinculo(tipo, devedorPessoaJuridica)
  const titulo = TITULO_POR_TIPO[tipo]

  // Estado: um arquivo por slot (null = não enviado).
  const [arquivos, setArquivos] = useState<
    Record<string, ArquivoAnexado | null>
  >(() => Object.fromEntries(slots.map(s => [s.tipo, null])))

  // Restaura os anexos já feitos. Em efeito, não no estado inicial: no servidor a memória do
  // layout está vazia, e ler na renderização quebraria a hidratação.
  useEffect(() => {
    const salvos = lerDocumentos(tipo)
    if (salvos.length === 0) return

    setArquivos(atual => {
      const restaurado = { ...atual }
      for (const doc of salvos) {
        if (doc.tipo in restaurado) restaurado[doc.tipo] = doc
      }
      return restaurado
    })
  }, [tipo, lerDocumentos])

  function listarAnexados(estado: Record<string, ArquivoAnexado | null>) {
    return slots
      .map(s => estado[s.tipo])
      .filter((a): a is ArquivoAnexado => a !== null)
  }

  function setArquivo(tipoSlot: string) {
    return (arquivo: ArquivoAnexado | null) => {
      const proximo = { ...arquivos, [tipoSlot]: arquivo }
      setArquivos(proximo)
      salvarDocumentos(tipo, listarAnexados(proximo))
    }
  }

  const obrigatoriosPreenchidos = slots
    .filter(s => !s.opcional)
    .every(s => arquivos[s.tipo] !== null)

  function revisarEnvio() {
    salvarDocumentos(tipo, listarAnexados(arquivos))

    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('etapa', 'revisao')
    // `?documentos=` removido da URL de propósito — os arquivos estão na memória do layout.
    destino.delete('documentos')

    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
        Anexe os documentos {titulo}
      </h1>

      <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
        {INSTRUCOES}
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

      {/* Logo abaixo da lista, como no Figma — não no rodapé da tela. Cinza enquanto faltar
          algum obrigatório (é o desabilitado do Figma); primário quando libera. */}
      <div className="pt-6 pb-2">
        <CustomButton
          type="button"
          variant={obrigatoriosPreenchidos ? 'primary' : 'secondary'}
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
