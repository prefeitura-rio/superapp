'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { RadioList } from '@/components/ui/custom/radio-list'
import { useMemo, useState } from 'react'

type SelectOption =
  | string
  | {
      label: string
      value: string
    }

interface SelectOptionDrawerContentProps {
  options: SelectOption[]
  value?: string
  onSelect: (value: string) => void
  onClose?: () => void
  name?: string
  /** When set, shows a search field above the list. */
  searchPlaceholder?: string
  /** Shown when search has no matches (Outro still listed below). */
  emptySearchMessage?: string
  /** When set (e.g. API load failure), shows this instead of the option list. */
  errorMessage?: string
  /** Value of the "Outro" option — selecting it keeps the drawer open for free text. */
  otherOptionValue?: string
  otherInputPlaceholder?: string
  initialOtherText?: string
  onConfirmOther?: (text: string) => void
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

function optionLabel(option: SelectOption) {
  return typeof option === 'string' ? option : option.label
}

function optionValue(option: SelectOption) {
  return typeof option === 'string' ? option : option.value
}

export function SelectOptionDrawerContent({
  options,
  value,
  onSelect,
  onClose,
  name = 'select-option',
  searchPlaceholder,
  emptySearchMessage,
  errorMessage,
  otherOptionValue,
  otherInputPlaceholder = 'Escreva aqui',
  initialOtherText = '',
  onConfirmOther,
}: SelectOptionDrawerContentProps) {
  const [query, setQuery] = useState('')
  const [draftValue, setDraftValue] = useState(value)
  const [otherText, setOtherText] = useState(initialOtherText)

  const normalizedOptions = useMemo(
    () =>
      options.map(option => ({
        label: optionLabel(option),
        value: optionValue(option),
      })),
    [options]
  )

  const otherOption = useMemo(
    () =>
      otherOptionValue
        ? normalizedOptions.find(option => option.value === otherOptionValue)
        : undefined,
    [normalizedOptions, otherOptionValue]
  )

  const filteredOptions = useMemo(() => {
    const mainOptions = otherOptionValue
      ? normalizedOptions.filter(option => option.value !== otherOptionValue)
      : normalizedOptions

    if (!searchPlaceholder || !query.trim()) {
      return otherOption ? [...mainOptions, otherOption] : mainOptions
    }

    const normalizedQuery = normalizeSearch(query)
    const matched = mainOptions.filter(option =>
      normalizeSearch(option.label).includes(normalizedQuery)
    )

    return otherOption ? [...matched, otherOption] : matched
  }, [
    normalizedOptions,
    otherOption,
    otherOptionValue,
    query,
    searchPlaceholder,
  ])

  const hasActiveSearch = !!searchPlaceholder && !!query.trim()
  const mainMatchCount = otherOptionValue
    ? filteredOptions.filter(option => option.value !== otherOptionValue).length
    : filteredOptions.length
  const showEmptySearchMessage =
    hasActiveSearch && mainMatchCount === 0 && !!emptySearchMessage

  const isOtherSelected = !!otherOptionValue && draftValue === otherOptionValue
  const canSubmitOther = otherText.trim().length > 0

  const handleChange = (nextValue: string) => {
    if (otherOptionValue && nextValue === otherOptionValue) {
      setDraftValue(nextValue)
      return
    }

    setDraftValue(nextValue)
    setOtherText('')
    onSelect(nextValue)
    onClose?.()
  }

  const handleConfirmOther = () => {
    if (!otherOptionValue || !canSubmitOther) return
    onConfirmOther?.(otherText.trim())
    onClose?.()
  }

  if (errorMessage) {
    return (
      <div className="flex w-full flex-col py-2">
        <p className="text-center text-sm font-normal leading-5 text-muted-foreground">
          {errorMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {searchPlaceholder && (
        <CustomInput
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
        />
      )}

      <div className="flex w-full flex-col gap-4">
        {showEmptySearchMessage && (
          <p className="text-sm font-normal leading-5 text-foreground">
            {emptySearchMessage}
          </p>
        )}

        {filteredOptions.length > 0 && (
          <RadioList
            options={filteredOptions}
            value={draftValue}
            onValueChange={handleChange}
            name={name}
          />
        )}

        {isOtherSelected && (
          <>
            <CustomInput
              value={otherText}
              onChange={event => setOtherText(event.target.value)}
              placeholder={otherInputPlaceholder}
              maxLength={50}
            />
            <CustomButton
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              className="bg-card hover:bg-card/80 text-foreground"
              disabled={!canSubmitOther}
              onClick={handleConfirmOther}
            >
              Enviar
            </CustomButton>
          </>
        )}
      </div>
    </div>
  )
}
