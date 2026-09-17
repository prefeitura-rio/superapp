import { SecondaryHeader } from '@/app/components/secondary-header'
import imovelAdicionado from '@/assets/imovel-adicionado.png'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Confirmação de que o imóvel entrou na lista do cidadão.
 */
export default function ImovelAdicionadoPage() {
  return (
    <div className="mx-auto flex min-h-lvh max-w-4xl flex-col pt-20 pb-4 text-foreground">
      <SecondaryHeader
        title=""
        className="max-w-4xl"
        route="/divida-ativa/imoveis"
      />

      <div className="flex flex-1 flex-col px-4">
        <h1 className="pt-2 pb-6 text-center text-3xl font-medium leading-9 text-foreground">
          Imóvel adicionado!
        </h1>

        {/* Decorativa: o título acima já diz o que aconteceu, então um alt só repetiria.
            `unoptimized` porque o render 3D tem textura fina que o re-encode webp q75 do
            otimizador borra — mesmo motivo pelo qual as ilustrações de sucesso do perfil
            são servidas sem otimização (welcome.svg). O PNG já é lossless e final. */}
        <div className="flex flex-1 items-center justify-center py-6">
          <Image
            src={imovelAdicionado}
            alt=""
            width={264}
            height={417}
            unoptimized
            priority
          />
        </div>

        <CustomButton asChild variant="primary" size="lg" fullWidth>
          <Link href="/divida-ativa">Voltar a página de Dívida ativa</Link>
        </CustomButton>
      </div>
    </div>
  )
}
