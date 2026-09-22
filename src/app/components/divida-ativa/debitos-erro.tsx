'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export type TipoErroDebitos = 'indisponivel' | 'nao-cadastrado'

/**
 * Copy provisória — escrita a partir do que a API devolve, sem Figma.
 *
 * O desenho entregue cobre "com débitos" e "sem débitos"; estes dois estados não existem
 * nele. Os textos aqui separam o que o cidadão pode resolver do que não pode, que é a
 * distinção que importa. Trocar por copy oficial quando houver.
 */
const ERROS: Record<
  TipoErroDebitos,
  {
    titulo: string
    descricao: string
    toast: string
    /** Só faz sentido onde repetir a chamada pode dar outro resultado. */
    permiteNovaTentativa: boolean
    acao: { rotulo: string; href: string }
  }
> = {
  indisponivel: {
    titulo: 'O serviço de dívida ativa está indisponível no momento',
    descricao:
      'O número que você informou está correto — quem não respondeu foi o sistema da Procuradoria. Tente novamente em alguns minutos.',
    toast:
      'Serviço de dívida ativa indisponível. Tente novamente em alguns minutos.',
    permiteNovaTentativa: true,
    acao: {
      rotulo: 'Consultar outro número',
      href: '/divida-ativa/parcelamento',
    },
  },
  'nao-cadastrado': {
    titulo: 'Este imóvel não está cadastrado no seu CPF',
    descricao:
      'A consulta de débitos só funciona para imóveis que você já adicionou em Meus Imóveis. Cadastre o imóvel e faça a consulta novamente.',
    toast: 'Este imóvel não está cadastrado no seu CPF.',
    // Repetir a chamada devolveria o mesmo 404: o que muda o resultado é cadastrar.
    permiteNovaTentativa: false,
    acao: { rotulo: 'Cadastrar imóvel', href: '/divida-ativa/imoveis/novo' },
  },
}

/**
 * Falha da consulta de débitos, **sem tirar o cidadão da tela**.
 *
 * O `error.tsx` do módulo redireciona para `/servicos` com um toast genérico. Para estes
 * dois casos isso é ruim por dois motivos: o cidadão perde o número que acabou de digitar,
 * e "tente novamente mais tarde" é mentira quando o problema é imóvel não cadastrado —
 * tentar de novo devolve o mesmo 404 para sempre.
 *
 * Por isso a página trata os dois como **estado**, não como exceção: nada é lançado, o
 * boundary não entra, e a URL continua a mesma. O `error.tsx` do módulo segue existindo
 * para o que é de fato inesperado.
 *
 * O toast acompanha o texto da tela em vez de substituí-lo: ele chama a atenção na hora,
 * mas some — e quem voltar à aba depois precisa continuar sabendo o que aconteceu.
 */
export function DebitosErro({ tipo }: { tipo: TipoErroDebitos }) {
  const router = useRouter()
  const erro = ERROS[tipo]
  const jaAvisou = useRef(false)

  useEffect(() => {
    // O StrictMode monta duas vezes em desenvolvimento e duplicaria o aviso.
    if (jaAvisou.current) return
    jaAvisou.current = true

    toast.error(erro.toast)
  }, [erro.toast])

  return (
    <div className="flex flex-1 flex-col px-4">
      <h1 className="pt-2 text-3xl font-medium leading-9 text-foreground">
        {erro.titulo}
      </h1>

      <p className="pt-6 text-sm font-normal leading-5 text-foreground-light">
        {erro.descricao}
      </p>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        {erro.permiteNovaTentativa && (
          /* `router.refresh()` refaz só a árvore do servidor: a URL e o critério digitado
             continuam de pé, ao contrário de um reload da página. */
          <CustomButton
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => router.refresh()}
          >
            Tentar novamente
          </CustomButton>
        )}

        <CustomButton
          asChild
          variant={erro.permiteNovaTentativa ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
        >
          <Link href={erro.acao.href}>{erro.acao.rotulo}</Link>
        </CustomButton>
      </div>
    </div>
  )
}
