type DisplayNameFeedbackProps = {
  displayName: string
  displayNameStateInput: string
}

export function DisplayNameFeedback({
  displayName,
  displayNameStateInput,
}: DisplayNameFeedbackProps) {
  const isInvalid = displayNameStateInput !== 'success'
  const isEmpty = displayName.length === 0

  let message: React.ReactNode = null

  if (isInvalid && !isEmpty) {
    // Case 1: invalid and not empty
    if (displayName.length < 2) {
      message = (
        <p className="text-sm text-destructive">
          Nome deve ter pelo menos 2 caracteres.
        </p>
      )
    } else if (displayName.length > 18) {
      message = (
        <p className="text-sm text-destructive">
          Nome deve ter no máximo 18 caracteres.
        </p>
      )
    } else {
      message = (
        <p className="text-sm text-destructive">
          Nome deve conter apenas letras e espaços.
        </p>
      )
    }
  } else if (displayName.length > 18) {
    // Case 2: valid but too long (show warning even when valid)
    message = (
      <p className="text-sm text-destructive">
        Nome deve ter no máximo 18 caracteres.
      </p>
    )
  }

  return (
    <div className="-mt-10 mb-4 self-baseline min-h-[20px] flex items-center">
      {message}
    </div>
  )
}
