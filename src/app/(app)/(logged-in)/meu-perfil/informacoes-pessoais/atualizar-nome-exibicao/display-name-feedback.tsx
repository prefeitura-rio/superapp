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
    } else if (displayName.length > 50) {
      message = (
        <p className="text-sm text-destructive">
          Nome deve ter no máximo 50 caracteres.
        </p>
      )
    } else {
      message = (
        <p className="text-sm text-destructive">
          Nome deve conter apenas letras e espaços.
        </p>
      )
    }
  }

  return (
    <div className="-mt-10 mb-4 self-baseline min-h-[20px] flex items-center">
      {message}
    </div>
  )
}
