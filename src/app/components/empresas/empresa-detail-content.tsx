'use client'

import type { VagaCardData } from '@/app/components/empregos/vaga-card'
import { VagaCard } from '@/app/components/empregos/vaga-card'
import { ChevronLeftIcon } from '@/assets/icons'
import type { EmpresaDetail } from '@/lib/empresa-utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface EmpresaDetailContentProps {
  empresa: EmpresaDetail
  vagas: VagaCardData[]
}

export function EmpresaDetailContent({
  empresa,
  vagas,
}: EmpresaDetailContentProps) {
  const router = useRouter()

  return (
    <div className="min-h-lvh bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header: apenas botão de voltar */}
        <div className="flex items-start">
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 flex items-center justify-center rounded-full w-11 h-11 bg-card text-foreground hover:bg-card/80 hover:cursor-pointer transition-colors [&_svg]:text-foreground"
            aria-label="Voltar"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Logo + nome da empresa abaixo do header */}
        <div className="mt-6 flex items-center gap-3 min-w-0">
          <div className="h-15 w-15 shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center">
            {empresa.logo ? (
              <Image
                src={empresa.logo}
                alt={empresa.nome}
                width={60}
                height={60}
                className="object-contain"
              />
            ) : (
              <span className="text-base font-semibold uppercase text-muted-foreground">
                {empresa.nome?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <h1 className="text-xl font-medium leading-6 text-foreground">
            {empresa.nome}
          </h1>
        </div>

        {/* Sobre a empresa */}
        <section className="mt-8">
          <h2 className="text-sm font-normal leading-5 text-foreground">
            Sobre a empresa
          </h2>
          <p className="text-sm font-normal leading-6 text-foreground-light whitespace-pre-line">
            {empresa.sobre}
          </p>
        </section>

        {/* Site, Setor, Tamanho, Especializações */}
        <div className="mt-4 space-y-4">
          {empresa.site ? (
            <div>
              <span className="text-sm font-normal text-foreground">Site</span>
              <a
                href={
                  empresa.site.startsWith('http')
                    ? empresa.site
                    : `https://${empresa.site}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#0a84ff] hover:underline"
              >
                {empresa.site.replace(/^https?:\/\//, '')}
              </a>
            </div>
          ) : null}
          <div>
            <span className="text-sm font-normal text-foreground">Setor</span>
            <p className="text-sm text-foreground-light">{empresa.setor}</p>
          </div>
          <div>
            <span className="text-sm font-normal text-foreground">
              Tamanho da empresa
            </span>
            <p className="text-sm text-foreground-light">{empresa.tamanho}</p>
          </div>
          <div>
            <span className="text-sm font-normal text-foreground">
              Especializações
            </span>
            <p className="text-sm text-foreground-light">
              {empresa.especializacoes}
            </p>
          </div>
        </div>

        {/* Vagas ofertadas */}
        <section className="mt-8">
          <h2 className="text-sm font-normal leading-5 text-foreground">
            Vagas ofertadas pela empresa
          </h2>
          {vagas.length === 0 ? (
            <p className="text-sm text-foreground-light">
              Nenhuma vaga aberta no momento.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-3">
              {vagas.map(vaga => (
                <VagaCard
                  key={vaga.id}
                  vaga={vaga}
                  variant="all"
                  className="w-full min-h-[10.25rem]"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
