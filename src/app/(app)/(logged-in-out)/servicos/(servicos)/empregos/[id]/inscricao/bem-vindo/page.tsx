import { BemVindoContent } from './bem-vindo-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BemVindoPage({ params }: PageProps) {
  const { id } = await params
  return (
    <div className="min-h-lvh pb-10">
      <BemVindoContent vagaId={id} />
    </div>
  )
}
