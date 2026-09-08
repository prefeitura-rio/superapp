'use client'

import { excluirImovel } from '@/actions/divida-ativa/excluir-imovel'
import { MoreVerticalIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

interface ImovelAcoesButtonProps {
  /** Id local do cadastro. A API renomeia e remove por ele, não pela inscrição. */
  id: number
  /** Como o imóvel aparece na lista — nome, endereço, ou a inscrição mascarada. */
  descricao: string
}

/**
 * Estados possíveis do botão. Um enum em vez de dois booleanos porque os dois sheets são
 * mutuamente exclusivos: abrir a confirmação **fecha** o menu, e um par de booleanos
 * permitiria o estado impossível de ambos abertos.
 */
type Estado = 'fechado' | 'menu' | 'confirmando-exclusao'

/**
 * As ações de um imóvel na lista, atrás dos três pontinhos do Figma.
 *
 * O menu tem duas saídas — "Editar nome", que navega para a tela de edição, e "Excluir
 * imóvel", que **não** exclui: abre a confirmação. Exclusão nunca acontece em um toque, e
 * o caminho até ela tem dois passos de propósito, porque é a única ação irreversível aqui.
 */
export function ImovelAcoesButton({ id, descricao }: ImovelAcoesButtonProps) {
  const [estado, setEstado] = useState<Estado>('fechado')
  const [enviando, startTransition] = useTransition()

  function confirmarExclusao() {
    startTransition(async () => {
      const resultado = await excluirImovel(id)

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      // Sem `router.refresh()` de propósito: o `revalidatePath` da action já devolve a rota
      // re-renderizada na mesma resposta (Next 16, guia de Server Actions), então um refresh
      // aqui seria uma segunda renderização do mesmo estado.
      setEstado('fechado')
    })
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Ações do imóvel ${descricao}`}
        onClick={() => setEstado('menu')}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/70 active:bg-secondary/70"
      >
        {/* O ícone se chama "vertical" mas já nasce rotacionado por um `transform` próprio,
            então o que aparece é a reticência horizontal do Figma. */}
        <MoreVerticalIcon className="size-5" />
      </button>

      <BottomSheet
        open={estado === 'menu'}
        onOpenChange={aberto => setEstado(aberto ? 'menu' : 'fechado')}
        title={`Ações do imóvel ${descricao}`}
      >
        <div className="flex flex-col gap-3 pt-2 px-2">
          <CustomButton asChild variant="primary" size="lg" fullWidth>
            <Link href={`/divida-ativa/imoveis/${id}/nome`}>Editar nome</Link>
          </CustomButton>

          <CustomButton
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setEstado('confirmando-exclusao')}
          >
            Excluir imóvel
          </CustomButton>
        </div>
      </BottomSheet>

      <BottomSheet
        open={estado === 'confirmando-exclusao'}
        onOpenChange={aberto =>
          setEstado(aberto ? 'confirmando-exclusao' : 'fechado')
        }
        title="Confirmação de exclusão de imóvel"
      >
        <div className="flex flex-col gap-6 pt-6 px-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-medium leading-6 text-popover-foreground">
              Você tem certeza que gostaria de excluir esse imóvel?
            </h2>

            {/* O aviso de irreversibilidade é parte da confirmação, não enfeite: sem ele o
                bottom sheet pergunta "tem certeza?" sem dizer do que o cidadão tem de ter
                certeza. */}
            <p className="text-sm font-normal leading-5 text-foreground-light">
              Essa ação é permanente e não poderá ser desfeita. Todos os dados
              desse imóvel serão excluídos.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <CustomButton
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              disabled={enviando}
              onClick={confirmarExclusao}
            >
              Excluir imóvel
            </CustomButton>

            <CustomButton
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              disabled={enviando}
              onClick={() => setEstado('fechado')}
            >
              Cancelar
            </CustomButton>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
