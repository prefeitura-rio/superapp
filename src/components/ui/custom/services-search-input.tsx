'use client'

import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import * as React from 'react'

interface ServicesSearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  onBack?: () => void
}

const ServicesSearchInput = React.forwardRef<
  HTMLInputElement,
  ServicesSearchInputProps
>(({ className, onClear, onBack, ...props }, ref) => {
  const [value, setValue] = React.useState<string>(
    (props.value as string) || ''
  )
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value as string)
    }
  }, [props.value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    props.onChange?.(e)
  }

  const handleClear = () => {
    setValue('')
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn(
        'flex h-16 items-center rounded-lg bg-[#1a1a1a] border border-[#333333] px-4 shadow-sm',
        className
      )}
    >
      <button
        type="button"
        className="mr-3 text-gray-400 hover:text-gray-300"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      <input
        ref={inputRef}
        className="flex-1 bg-transparent border-0 text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-0 text-base"
        value={value}
        onChange={handleChange}
        {...props}
      />

      <div className="flex items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="hover:text-gray-300 p-1 bg-white text-black font-xs rounded-full font-bold"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
})

ServicesSearchInput.displayName = 'ServicesSearchInput'

export { ServicesSearchInput }
