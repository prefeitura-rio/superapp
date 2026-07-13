'use client'

import { AiImproveButton } from '@/components/ui/custom/ai-improve-button'
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

interface AiImproveTextareaProps extends React.ComponentProps<'textarea'> {
  error?: string
  showAiImprove?: boolean
  minCharsForAi?: number
  onImprove?: (text: string) => Promise<string> | string
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
  const isReady = currentText.length >= minCharsForAi

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

  async function handleImproveClick() {
    if (!onImprove || !isReady || hasImproved || isImproving || disabled) return
    setIsImproving(true)
    try {
      const improved = await onImprove(currentText)
      setOriginalText(currentText)
      syncValue(improved)
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
      <Textarea
        ref={textareaRef}
        error={error}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          'min-h-0 flex-1 resize-none border-0 bg-transparent p-0 text-sm! shadow-none dark:bg-transparent',
          'placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground!',
          'focus-visible:border-transparent'
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
