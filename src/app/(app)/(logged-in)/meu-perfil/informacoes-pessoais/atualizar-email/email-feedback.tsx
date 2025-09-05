type EmailFeedbackProps = {
  email: string
  emailStateInput: string
  suggestion?: { suggestedEmail: string } | null
  onAcceptSuggestion: () => void
}

export function EmailFeedback({
  email,
  emailStateInput,
  suggestion,
  onAcceptSuggestion,
}: EmailFeedbackProps) {
  const isInvalid = emailStateInput !== 'success'
  const hasSuggestion = !!suggestion?.suggestedEmail

  let message: React.ReactNode = null

  if (isInvalid && !hasSuggestion && email.length > 0) {
    // Case 1: invalid and no suggestion
    message = <p className="text-sm text-destructive">Email inválido.</p>
  } else if (hasSuggestion) {
    // Case 2 and 3: suggestion available
    message = (
      <p
        className={`text-sm ${
          isInvalid ? 'text-destructive' : 'text-foreground-light'
        }`}
      >
        {isInvalid && 'Email inválido. '}
        Você quis dizer{' '}
        <span
          className={`underline cursor-pointer ${
            isInvalid ? 'text-destructive' : 'text-blue-600'
          }`}
          onClick={onAcceptSuggestion}
        >
          {suggestion!.suggestedEmail}
        </span>
        ?
      </p>
    )
  }

  return (
    <div className="-mt-10 mb-4 self-baseline min-h-[20px] flex items-center">
      {message}
    </div>
  )
}
