import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { getTermosDeUsoDocument } from '@/constants/termos-de-uso/content'
import {
  TERMOS_DE_USO_PLATFORMS,
  findTermosDeUsoPlatform,
} from '@/constants/termos-de-uso/platforms'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TermosDeUsoDetail } from '../components/termos-de-uso-detail'

/** Só as plataformas cadastradas existem; qualquer outro slug é 404. */
export const dynamicParams = false

interface TermosDeUsoPlataformaPageProps {
  params: Promise<{ plataforma: string }>
}

export function generateStaticParams() {
  return TERMOS_DE_USO_PLATFORMS.map(platform => ({
    plataforma: platform.slug,
  }))
}

export async function generateMetadata({
  params,
}: TermosDeUsoPlataformaPageProps): Promise<Metadata> {
  const { plataforma } = await params
  const platform = findTermosDeUsoPlatform(plataforma)
  if (!platform) return {}
  return {
    title: `Termos de uso: ${platform.name}`,
    description: `Termo de uso e aviso de privacidade da plataforma ${platform.name} da Prefeitura do Rio.`,
  }
}

export default async function TermosDeUsoPlataformaPage({
  params,
}: TermosDeUsoPlataformaPageProps) {
  const { plataforma } = await params
  const platform = findTermosDeUsoPlatform(plataforma)
  const document = getTermosDeUsoDocument(plataforma)
  if (!platform || !document) notFound()

  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />
      <main className="mx-auto w-full max-w-4xl px-4 pb-10">
        <TermosDeUsoDetail platform={platform} document={document} />
      </main>
    </div>
  )
}
