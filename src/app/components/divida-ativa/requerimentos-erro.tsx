'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

const TOAST =
  'Serviço de dívida ativa indisponível. Tente novamente em alguns minutos.'

/**
 * Falha da consulta de requerimentos, **sem tirar o cidadão da tela** — o mesmo padrão de
 * `DebitosErro`: o `error.tsx` do módulo redirecionaria para `/servicos`, e aqui o
 * cidadão perderia o protocolo que acabou de digitar. O toast chama a atenção na hora; o
 * texto da tela fica para quem voltar à aba depois. Copy provisória, sem Figma.
 */
export function RequerimentosErro() {
  const router = useRouter()
  const jaAvisou = useRef(false)

  useEffect(() => {
    // O StrictMode monta duas vezes em desenvolvimento e duplicaria o aviso.
    if (jaAvisou.current) return
    jaAvisou.current = true

    toast.error(TOAST)
  }, [])

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 text-3xl font-medium leading-9 text-foreground">
        O serviço de dívida ativa está indisponível no momento
      </h1>

      <p className="pt-6 text-sm font-normal leading-5 text-foreground-light">
        Não conseguimos consultar seus requerimentos agora — quem não respondeu
        foi o sistema da Procuradoria. Tente novamente em alguns minutos.
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        {/* `router.refresh()` refaz só a árvore do servidor: a URL e o protocolo seguem. */}
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.refresh()}
        >
          Tentar novamente
        </CustomButton>

        <CustomButton asChild variant="secondary" size="lg" fullWidth>
          <Link href="/divida-ativa/acompanhamento">
            Voltar ao acompanhamento
          </Link>
        </CustomButton>
      </div>
    </div>
  )
}
