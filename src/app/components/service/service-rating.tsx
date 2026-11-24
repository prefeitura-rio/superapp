'use client'

import { ThumbsDownIcon, ThumbsUpIcon } from '@/assets/icons'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  DESCRIPTION_MAX_LENGTH,
  OTHER_REASON,
  REJECTION_REASON_OPTIONS,
  type RejectionReason,
} from '@/lib/carta-servicos/avaliacao/reasons'
import type { ServiceRatingRequest } from '@/lib/carta-servicos/avaliacao/request'
import type { ServiceRatingTarget } from '@/lib/carta-servicos/types'
import { cn } from '@/lib/utils'
import { type ReactNode, useId, useState } from 'react'
import toast from 'react-hot-toast'

type Vote = ServiceRatingRequest['vote']

interface ServiceRatingProps {
  target: ServiceRatingTarget
}

/**
 * "Este conteúdo foi útil?" no fim da página de serviço.
 *
 * Like envia na hora. Dislike só abre o formulário; o envio acontece em
 * "Enviar avaliação". Clicar de novo na resposta já enviada não envia nada.
 *
 * Medidas do Figma (SuperApp oficial › Atualização da página de serviço):
 * divisor e card separados por 24px; card `bg-border`, `rounded-2xl`, `py-3 px-4`;
 * botões de 36px; chips de 32px; formulário com 20px entre blocos.
 */
export function ServiceRating({ target }: ServiceRatingProps) {
  const headingId = useId()
  const formHeadingId = useId()
  const descriptionId = useId()

  const [submitted, setSubmitted] = useState<Vote | null>(null)
  const [selected, setSelected] = useState<Vote | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [reasons, setReasons] = useState<RejectionReason[]>([])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasOtherReason = reasons.includes(OTHER_REASON)

  function closeForm() {
    setIsFormOpen(false)
    setReasons([])
    setDescription('')
  }

  async function send(body: ServiceRatingRequest): Promise<boolean> {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/servicos/${encodeURIComponent(target.slug)}/avaliacao`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return true
    } catch {
      toast.error(ERROR_MESSAGE, { id: TOAST_ID, duration: TOAST_DURATION })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLike() {
    if (isSubmitting) return
    setSelected('up')
    closeForm()

    if (submitted === 'up') {
      showThanks()
      return
    }

    const ok = await send({ vote: 'up', articleId: target.articleId })
    if (ok) {
      setSubmitted('up')
      showThanks()
    } else {
      setSelected(submitted)
    }
  }

  function handleDislike() {
    if (isSubmitting || isFormOpen) return
    setSelected('down')

    if (submitted === 'down') {
      showThanks()
      return
    }

    setIsFormOpen(true)
  }

  function toggleReason(reason: RejectionReason, isChecked: boolean) {
    setReasons(current =>
      current.includes(reason)
        ? current.filter(item => item !== reason)
        : [...current, reason]
    )
    if (isChecked && reason === OTHER_REASON) setDescription('')
  }

  async function handleSubmitDislike() {
    if (isSubmitting || reasons.length === 0) return

    const ok = await send({
      vote: 'down',
      articleId: target.articleId,
      rejectionReasons: reasons,
      ...(hasOtherReason && description.trim()
        ? { rejectionDescription: description.trim() }
        : {}),
    })

    if (ok) {
      setSubmitted('down')
      closeForm()
      showThanks()
    }
  }

  return (
    <section aria-labelledby={headingId} className="mt-6 flex flex-col gap-6">
      <Separator />

      <div className="flex flex-col gap-5 rounded-2xl bg-border px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <h2
            id={headingId}
            className="text-base font-medium leading-6 text-foreground"
          >
            Este conteúdo foi útil?
          </h2>

          <div className="flex shrink-0 items-center gap-2">
            <VoteButton
              label="Sim, foi útil"
              isSelected={selected === 'up'}
              disabled={isSubmitting}
              onClick={handleLike}
            >
              <ThumbsUpIcon aria-hidden />
            </VoteButton>
            <VoteButton
              label="Não foi útil"
              isSelected={selected === 'down'}
              disabled={isSubmitting}
              onClick={handleDislike}
            >
              <ThumbsDownIcon aria-hidden />
            </VoteButton>
          </div>
        </div>

        {isFormOpen && (
          <form
            aria-labelledby={formHeadingId}
            className="flex flex-col gap-5 border-t border-border pt-3"
            onSubmit={event => {
              event.preventDefault()
              handleSubmitDislike()
            }}
          >
            <p
              id={formHeadingId}
              className="text-sm font-normal leading-5 text-foreground"
            >
              O que podemos melhorar?
            </p>

            <div
              role="group"
              aria-labelledby={formHeadingId}
              className="flex flex-wrap gap-2"
            >
              {REJECTION_REASON_OPTIONS.map(option => {
                const isChecked = reasons.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isChecked}
                    disabled={isSubmitting}
                    onClick={() => toggleReason(option.value, isChecked)}
                    className={cn(
                      'h-8 rounded-full px-3 py-1.5 text-sm font-normal leading-5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed',
                      isChecked
                        ? 'bg-slate-500 text-background'
                        : 'bg-white text-foreground'
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            {hasOtherReason && (
              <div>
                <label htmlFor={descriptionId} className="sr-only">
                  Quer explicar melhor?
                </label>
                <Textarea
                  id={descriptionId}
                  value={description}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  disabled={isSubmitting}
                  placeholder="Quer explicar melhor?"
                  onChange={event => setDescription(event.target.value)}
                  className="min-h-[85px] resize-none rounded-xl border border-border bg-background p-3 text-sm! leading-5 text-foreground shadow-none placeholder:text-zinc-500 dark:bg-background"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || reasons.length === 0}
                className="flex h-13 w-full items-center justify-center rounded-full bg-primary text-sm font-normal leading-5 text-white transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar avaliação
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

interface VoteButtonProps {
  label: string
  isSelected: boolean
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function VoteButton({
  label,
  isSelected,
  disabled,
  onClick,
  children,
}: VoteButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid size-9 place-items-center rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed',
        isSelected
          ? 'border-slate-500 bg-slate-500 text-white'
          : 'border-border bg-background text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function showThanks() {
  toast(THANKS_MESSAGE, {
    id: TOAST_ID,
    duration: TOAST_DURATION,
    className:
      'rounded-full! bg-primary! text-white! px-4! py-2! text-sm! leading-5! font-normal! shadow-lg! mb-2! max-w-none! [&>[role=status]]:m-0!',
  })
}

const TOAST_ID = 'service-rating'
const TOAST_DURATION = 3000
const THANKS_MESSAGE = 'Obrigado pela avaliação!'
const ERROR_MESSAGE =
  'Não foi possível registrar sua avaliação agora. Tente mais tarde.'
