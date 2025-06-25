'use client'

import { cn } from '@/lib/utils'
import { ArrowLeft, Search, X } from 'lucide-react'
import * as React from 'react'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  onBack?: () => void
  showIcons?: boolean // NEW PROP
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      onClear,
      onBack,
      showIcons = true,
      value: controlledValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string>(
      (controlledValue as string) || ''
    )
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue as string)
      }
    }, [controlledValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      onChange?.(e)
    }

    const handleClear = () => {
      setValue('')
      // Fire a synthetic event to notify parent (for controlled input)
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      onClear?.()
      inputRef.current?.focus()
    }

    return (
      <div
        className={cn(
          'flex h-16 items-center rounded-lg bg-card border border-border px-4 shadow-sm',
          className
        )}
      >
        {showIcons && (
          <button
            type="button"
            onClick={onBack}
            className="mr-3 text-gray-400 hover:text-gray-300"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <input
          ref={inputRef}
          className="flex-1 bg-transparent border-0 text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-base"
          value={value}
          onChange={handleChange}
          {...props}
        />

        <div className="flex items-center gap-3">
          {showIcons && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-white hover:text-white/80 p-0.5 bg-foreground rounded-full"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showIcons && (
            <button
              type="button"
              className="text-card-foreground hover:text-card-foreground"
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }
