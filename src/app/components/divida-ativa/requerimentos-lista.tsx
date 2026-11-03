import {
  type DestaqueRequerimento,
  RequerimentoCard,
} from '@/app/components/divida-ativa/requerimento-card'
import type { RequerimentoDividaAtiva } from '@/types/divida-ativa'

interface RequerimentosListaProps {
  requerimentos: RequerimentoDividaAtiva[]
  destaque: DestaqueRequerimento
}

/**
 * "Lista de requerimentos de parcelamento" — o mesmo título para a lista do CPF e para a
 * consulta por protocolo (que lista um só), como no Figma. Server Component: só leitura.
 */
export function RequerimentosLista({
  requerimentos,
  destaque,
}: RequerimentosListaProps) {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
        Lista de requerimentos de parcelamento
      </h1>

      <ul className="flex flex-col gap-3">
        {requerimentos.map(requerimento => (
          <li key={`${requerimento.ano ?? ''}/${requerimento.protocolo}`}>
            <RequerimentoCard requerimento={requerimento} destaque={destaque} />
          </li>
        ))}
      </ul>
    </div>
  )
}
