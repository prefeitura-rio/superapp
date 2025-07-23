import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/ui/custom/custom-button'

interface OnboardingControlsProps {
  showFinishButton: boolean
  showSkipButton: boolean
  onNext: () => void
  onFinish: () => void
  onSkip: () => void
  isBelowBreakpoint: boolean
  disabled: boolean
}

export function OnboardingControls({
  showFinishButton,
  showSkipButton,
  onNext,
  onFinish,
  onSkip,
  isBelowBreakpoint,
  disabled,
}: OnboardingControlsProps) {
  return (
    <div className={`${isBelowBreakpoint ? 'pt-7' : 'pt-15'}`}>
      <CustomButton
        className="w-full text-white px-8 py-3 rounded-full shadow-md bg-primary hover:bg-primary/80"
        size="lg"
        onClick={showFinishButton ? onFinish : onNext}
        variant="primary"
        disabled={disabled}
      >
        {showFinishButton ? 'Concluir' : 'Próximo'}
      </CustomButton>

      <Button
        className={`w-full text-muted-foreground bg-transparent px-8 py-4 rounded-lg shadow-none cursor-pointer hover:bg-transparent transition-opacity duration-300 ${
          showSkipButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        size="lg"
        onClick={onSkip}
        disabled={disabled}
      >
        Pular
      </Button>
    </div>
  )
}
