import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

/**
 * Confirmação de que o imóvel entrou na lista do cidadão.
 *
 * TODO(design): falta a ilustração 3D do Figma (casa com a moradora na cadeira). O asset
 * ainda não foi exportado; quando chegar, entra aqui como `next/image` com width/height
 * explícitos, no lugar do espaço reservado.
 */
export default function ImovelAdicionadoPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-xl"
        route="/divida-ativa/imoveis"
      />

      <div className="flex flex-1 flex-col px-4">
        <h1 className="pt-2 pb-6 text-3xl font-medium leading-9 text-foreground">
          Imóvel adicionado!
        </h1>

        <CustomButton
          asChild
          variant="primary"
          size="lg"
          fullWidth
          className="mt-auto"
        >
          <Link href="/divida-ativa">Voltar a página de Dívida ativa</Link>
        </CustomButton>
      </div>
    </div>
  )
}
