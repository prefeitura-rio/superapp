import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

interface SimulacaoAvisoProps {
  titulo: string
  descricao: string
  /** Para onde o botão leva — em geral, de volta aos débitos para mudar a seleção. */
  acao: { rotulo: string; href: string }
}

/**
 * Estado da simulação quando não há o que escolher: o DAM recusou as CDAs, não ofereceu
 * datas ou não respondeu.
 *
 * Copy provisória, como em `DebitosErro` — o Figma não desenha estes estados. Fica na tela
 * em vez de subir para o `error.tsx`, para o cidadão não perder a seleção que fez.
 */
export function SimulacaoAviso({
  titulo,
  descricao,
  acao,
}: SimulacaoAvisoProps) {
  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 pb-4 text-3xl font-medium leading-9 text-foreground">
        {titulo}
      </h1>
      <p className="text-sm leading-5 text-foreground-light">{descricao}</p>

      <div className="mt-auto pt-6">
        <CustomButton asChild variant="primary" size="lg" fullWidth>
          <Link href={acao.href}>{acao.rotulo}</Link>
        </CustomButton>
      </div>
    </div>
  )
}
