import {
  MODOS_CONSULTA,
  ORDEM_MODOS_CONSULTA,
} from '@/app/components/divida-ativa/modos-consulta'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import Link from 'next/link'

/**
 * Primeiro passo da consulta de parcelamento: o cidadão escolhe **por qual número** vai
 * buscar.
 *
 * O modo escolhido vira `?modo=` na mesma rota, em vez de uma rota por modo. São dois
 * estados da mesma tela ("Selecione uma das informações para consulta" é o título dos dois
 * passos), o voltar do navegador funciona sozinho, e o estado compartilhável fica na URL,
 * como o projeto exige.
 *
 * Server Component: são três links, sem interatividade.
 */
export function ModoConsultaList() {
  return (
    <ul className="flex flex-col gap-2 px-4">
      {ORDEM_MODOS_CONSULTA.map(id => {
        const modo = MODOS_CONSULTA[id]

        return (
          <li key={modo.id}>
            <Link
              href={`/divida-ativa/parcelamento?modo=${modo.id}`}
              className="flex w-full items-center justify-between gap-4 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-secondary active:bg-secondary"
            >
              <span className="text-sm font-normal leading-5 text-foreground">
                {modo.rotuloLista}
              </span>
              <ChevronRightIcon className="shrink-0 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
