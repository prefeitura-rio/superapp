'use client'

import {
  type AiImproveContext,
  improveTextWithAiAction,
} from '@/actions/improve-text-with-ai'
import { AiImproveButton } from '@/components/ui/custom/ai-improve-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  type ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'

interface AiImproveTextareaProps extends React.ComponentProps<'textarea'> {
  error?: string
  showAiImprove?: boolean
  minCharsForAi?: number
  aiContext?: AiImproveContext
  onImprove?: (text: string) => Promise<string> | string
}

function countNonWhitespaceChars(text: string): number {
  return text.replace(/\s/g, '').length
}

export const AiImproveTextarea = forwardRef<
  HTMLTextAreaElement,
  AiImproveTextareaProps
>(function AiImproveTextarea(
  {
    className,
    error,
    showAiImprove = false,
    minCharsForAi = 30,
    aiContext,
    onImprove,
    onChange,
    value,
    defaultValue,
    disabled,
    ...props
  },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

  const [internalValue, setInternalValue] = useState(() =>
    String(value ?? defaultValue ?? '')
  )
  const [originalText, setOriginalText] = useState<string | null>(null)
  const [isImproving, setIsImproving] = useState(false)

  useEffect(() => {
    if (value !== undefined) setInternalValue(String(value))
  }, [value])

  useEffect(() => {
    if (value !== undefined) return
    const el = textareaRef.current
    if (el?.value) setInternalValue(el.value)
  }, [value])

  const currentText = value !== undefined ? String(value) : internalValue
  const hasImproved = originalText !== null
  const isReady = countNonWhitespaceChars(currentText) >= minCharsForAi

  const syncValue = useCallback(
    (next: string) => {
      const el = textareaRef.current
      if (!el) return
      el.value = next
      setInternalValue(next)
      onChange?.({
        target: el,
        currentTarget: el,
      } as ChangeEvent<HTMLTextAreaElement>)
    },
    [onChange]
  )

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInternalValue(e.target.value)
    onChange?.(e)
  }

  async function runDefaultImprove(text: string): Promise<string | null> {
    if (!aiContext) return null
    const result = await improveTextWithAiAction({ text, context: aiContext })
    if (!result.success) return null
    return result.text
  }

  async function handleImproveClick() {
    if (!isReady || hasImproved || isImproving || disabled) return
    if (!onImprove && !aiContext) return

    setIsImproving(true)
    try {
      const improved = onImprove
        ? await onImprove(currentText)
        : await runDefaultImprove(currentText)

      if (!improved) {
        toast.error('Ops... tente novamente mais tarde.')
        return
      }

      setOriginalText(currentText)
      syncValue(improved)
    } catch {
      toast.error('Ops... tente novamente mais tarde.')
    } finally {
      setIsImproving(false)
    }
  }

  function handleRevertClick() {
    if (originalText === null || disabled) return
    syncValue(originalText)
    setOriginalText(null)
  }

  if (!showAiImprove) {
    return (
      <Textarea
        ref={textareaRef}
        error={error}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={className}
        {...props}
      />
    )
  }

  return (
    <div
      aria-invalid={!!error}
      className={cn(
        'flex w-full min-h-16 flex-col gap-2 px-5 py-4 transition-[color,box-shadow,border-color]',
        className
      )}
    >
      {isImproving && (
        <div
          className="flex min-h-24 flex-1 flex-col gap-2"
          aria-busy
          aria-label="Melhorando texto com IA"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[76%]" />
          <Skeleton className="h-4 w-[82%]" />
        </div>
      )}
      <Textarea
        ref={textareaRef}
        error={error}
        disabled={disabled || isImproving}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          'min-h-0 flex-1 resize-none border-0 bg-transparent p-0 text-sm! shadow-none dark:bg-transparent',
          'placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground!',
          'focus-visible:border-transparent',
          isImproving && 'hidden'
        )}
        {...props}
      />

      <div className="flex items-center">
        {hasImproved ? (
          <AiImproveButton
            mode="revert"
            disabled={disabled}
            onClick={handleRevertClick}
          />
        ) : (
          <AiImproveButton
            mode="improve"
            isReady={isReady}
            disabled={disabled || isImproving}
            onClick={handleImproveClick}
          />
        )}
      </div>
    </div>
  )
})
