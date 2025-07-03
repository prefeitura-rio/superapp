import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <div
            className="mb-4 flex items-center justify-center"
            style={{ width: 350, height: 350 }}
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
          <h1 className="text-6xl font-bold text-primary mb-2">Oops...</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Página não encontrada
          </h2>
        </div>

        <div className="space-y-4">
          <CustomButton size="xl" variant="primary" fullWidth>
            <Link href="/">Voltar ao início</Link>
          </CustomButton>

          <CustomButton size="xl" variant="outline" fullWidth>
            <Link href="/services">Acessar serviços</Link>
          </CustomButton>
        </div>
      </div>
    </div>
  )
}
