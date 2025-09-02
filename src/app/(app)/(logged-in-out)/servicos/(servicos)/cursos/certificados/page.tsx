import { SecondaryHeader } from '@/app/components/secondary-header'

export default function CoursesCertifiedPage() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <SecondaryHeader title="Certificados" />

      <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
        <p className="block text-lg text-muted-foreground text-center">
          Você ainda não possui nenhum certificado.
        </p>
      </div>

      {/* <div className="relative overflow-hidden mt-15 px-4">
        <MyCertificatesCard />
      </div> */}
    </div>
  )
}
