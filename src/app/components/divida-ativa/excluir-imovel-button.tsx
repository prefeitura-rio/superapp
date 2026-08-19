'use client'

import { excluirImovel } from '@/actions/divida-ativa/excluir-imovel'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'

interface ExcluirImovelButtonProps {
  /** Id local do cadastro. A API remove por ele, não pela inscrição imobiliária. */
  id: number
  /** Como o imóvel aparece na lista — endereço, ou a inscrição mascarada se não houver. */
  descricao: string
}

/**
 * Exclusão nunca acontece no primeiro toque: a lixeira abre um bottom sheet de confirmação,
 * e só o botão de lá chama a Server Action.
 */
export function ExcluirImovelButton({
  id,
  descricao,
}: ExcluirImovelButtonProps) {
  const [aberto, setAberto] = useState(false)
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
      setAberto(false)
    })
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Excluir imóvel ${descricao}`}
        onClick={() => setAberto(true)}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/70 active:bg-secondary/70"
      >
        <TrashIcon className="size-5" />
      </button>

      <BottomSheet
        open={aberto}
        onOpenChange={setAberto}
        title="Confirmação de exclusão de imóvel"
      >
        <div className="flex flex-col gap-6 pt-6 px-2">
          <h2 className="text-xl font-medium leading-6 text-popover-foreground">
            Você tem certeza que gostaria de excluir esse imóvel?
          </h2>

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
              onClick={() => setAberto(false)}
            >
              Cancelar
            </CustomButton>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
