'use client'

import { ChevronLeftIcon, SearchIcon, XIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
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

    // Merge refs to support both internal ref and forwarded ref
    const mergedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

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
          'flex h-14 items-center rounded-full bg-card px-4',
          className
        )}
      >
        {showIcons && (
          <button
            type="button"
            onClick={onBack}
            className="mr-4 text-card-foreground hover:text-card-foreground/50 transition-all duration-200"
            aria-label="Back"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}

        <input
          ref={mergedRef}
          className="flex-1 bg-transparent border-0 text-muted-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-0 truncate pr-3"
          value={value}
          onChange={handleChange}
          {...props}
        />

        <div className="flex items-center gap-2">
          {showIcons && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-card-foreground  rounded-full"
              aria-label="Clear search"
            >
              <XIcon className="h-6 w-6 text-card-foreground" />
            </button>
          )}
          {showIcons && (
            <button
              type="button"
              className="text-card-foreground hover:text-card-foreground"
              aria-label="Search"
            >
              <SearchIcon className="h-6 w-6 text-card-foreground" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }
