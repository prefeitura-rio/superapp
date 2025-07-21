import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'
import { SecondaryHeader } from './components/secondary-header'

export default function NotFound() {
  return (
    <div className="max-w-md min-h-lvh mx-auto pt-30 flex flex-col">
      <SecondaryHeader title="" />
      <div className="px-4">
        <div
          className="mb-8 flex items-center justify-center"
          style={{ height: 250 }}
        >
          <video
            src="/3d_test.mp4"
            width={350}
            height={350}
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
            }}
            loop
            autoPlay
            muted
            playsInline
          />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-8">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-16">
          Não encontramos a página que você tentou acessar. Por favor, verifique
          o link ou retorne à pagina inicial.
        </p>
        <div className="space-y-4 mb-16">
          <CustomButton
            size="xl"
            className="rounded-full"
            variant="primary"
            fullWidth
          >
            <Link href="/">Voltar para a Home</Link>
          </CustomButton>
        </div>
      </div>
    </div>
  )
}
