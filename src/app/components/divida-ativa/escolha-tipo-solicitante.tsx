'use client'

import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { TipoSolicitante } from './tipos-solicitante'

interface OpcaoTipo {
  tipo: TipoSolicitante
  titulo: string
  descricao: string | null
}

const OPCOES: OpcaoTipo[] = [
  {
    tipo: 'CONTRIBUINTE',
    titulo: 'O próprio contribuinte',
    descricao: 'Você é a pessoa que consta na CDA como devedora',
  },
  {
    tipo: 'SOCIO_RESPONSAVEL',
    titulo: 'Sócio responsável',
    descricao: 'Você responde pela empresa que consta na CDA como devedora',
  },
  {
    tipo: 'PROCURADOR',
    titulo: 'Procurador',
    descricao: 'Você representa o contribuinte por meio de procuração',
  },
  {
    tipo: 'PROPRIETARIO_POSSUIDOR',
    titulo: 'Atual proprietário/possuidor',
    descricao:
      'O imóvel é seu hoje, mas a CDA ou a inscrição imobiliária está em nome de outra pessoa',
  },
]

interface EscolhaTipoSolicitanteProps {
  /** Parâmetros correntes da URL (cdas, data, parcelas, critério). */
  searchParamsAtual: Record<string, string>
}

/**
 * "Escolha o tipo de vínculo" — primeira etapa do requerimento de parcelamento.
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
  // Quem voltou da etapa seguinte encontra marcado o tipo que tinha escolhido.
  const tipoAtual = searchParamsAtual.tipo

  function escolher(tipo: TipoSolicitante) {
    const destino = new URLSearchParams(searchParamsAtual)
    destino.set('etapa', 'requerente')
    destino.set('tipo', tipo)
    router.push(`/divida-ativa/parcelamento/requerimento?${destino}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
        Escolha o tipo de vínculo
      </h1>

      <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
        Indique qual é a sua relação com o débito que será parcelado. Em
        seguida, anexe a documentação exigida para esse vínculo.
      </p>

      <ul className="flex flex-col gap-2">
        {OPCOES.map(({ tipo, titulo, descricao }) => (
          <li key={tipo}>
            <button
              type="button"
              onClick={() => escolher(tipo)}
              aria-current={tipoAtual === tipo ? 'true' : undefined}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 text-left transition-colors ${
                tipoAtual === tipo
                  ? 'bg-primary/10 ring-2 ring-primary'
                  : 'bg-card hover:bg-secondary'
              }`}
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
