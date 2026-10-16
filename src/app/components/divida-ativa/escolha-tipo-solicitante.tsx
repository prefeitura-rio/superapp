'use client'

import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Os cinco tipos de solicitante que o DAM aceita.
 *
 * O valor string é o que vai em `descVinculoRequerente` no corpo do requerimento e em
 * `?tipo=` na URL — mantidos em inglês para não depender de copy que pode mudar.
 */
export type TipoSolicitante =
  | 'PESSOA_FISICA'
  | 'PESSOA_JURIDICA'
  | 'SOCIEDADE_ANONIMA'
  | 'PROCURADOR'
  | 'OUTRO'

interface OpcaoTipo {
  tipo: TipoSolicitante
  titulo: string
  descricao: string | null
}

const OPCOES: OpcaoTipo[] = [
  {
    tipo: 'PESSOA_FISICA',
    titulo: 'Pessoa Física',
    descricao:
      'O próprio contribuinte, sócio responsável, procurador ou atual proprietário/possuidor',
  },
  {
    tipo: 'PESSOA_JURIDICA',
    titulo: 'Pessoa Jurídica',
    descricao: null,
  },
  {
    tipo: 'SOCIEDADE_ANONIMA',
    titulo: 'Sociedade anônima',
    descricao: null,
  },
  {
    tipo: 'PROCURADOR',
    titulo: 'Procurador',
    descricao: null,
  },
  {
    tipo: 'OUTRO',
    titulo: 'Outro',
    descricao:
      'Quando o atual proprietário do imóvel é diferente do constante na CDA ou inscrição imobiliária',
  },
]

interface EscolhaTipoSolicitanteProps {
  /** Parâmetros correntes da URL (cdas, data, parcelas, critério). */
  searchParamsAtual: Record<string, string>
}

/**
 * "Escolha o tipo de solicitante" — primeira etapa do requerimento de parcelamento.
 *
 * A escolha define quais documentos serão exigidos na etapa seguinte. O tipo vai em
 * `?tipo=` na URL para a etapa de documentos conseguir mostrar a lista correta, e no envio
 * do requerimento vai em `descVinculoRequerente`.
 *
 * Client Component: a navegação é do lado do cliente (sem server action, sem formulário).
 */
export function EscolhaTipoSolicitante({
  searchParamsAtual,
}: EscolhaTipoSolicitanteProps) {
  const router = useRouter()

  function escolher(tipo: TipoSolicitante) {
    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('etapa', 'documentos')
    destino.set('tipo', tipo)
    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
        Escolha o tipo de solicitante
      </h1>

      <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
        Indique quem está solicitando o parcelamento: Pessoa Física, Pessoa
        Jurídica, Sociedade Anônima, Procurador ou Outro.
        <br />
        Em seguida, anexe a documentação exigida.
      </p>

      <ul className="flex flex-col gap-2">
        {OPCOES.map(({ tipo, titulo, descricao }) => (
          <li key={tipo}>
            <button
              type="button"
              onClick={() => escolher(tipo)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-5 text-foreground">
                  {titulo}
                </span>
                {descricao && (
                  <span className="text-xs font-normal leading-4 text-foreground-light">
                    {descricao}
                  </span>
                )}
              </span>
              <ChevronRight
                className="size-5 shrink-0 text-foreground-light"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
