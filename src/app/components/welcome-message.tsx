import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import { formatUserName } from '@/lib/utils'

export function WelcomeMessage({
  show,
  fadeOut,
  userInfo,
}: {
  show: boolean
  fadeOut: boolean
  userInfo: { cpf: string; name: string }
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-600 ${
        show
          ? fadeOut
            ? 'opacity-0'
            : 'opacity-100'
          : 'opacity-0 pointer-events-none'
      } bg-background`}
      style={{
        animation: show && !fadeOut ? 'fadeIn 600ms ease-in-out' : undefined,
      }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full px-4">
        <div className="mb-12">
          <ThemeAwareVideo
            source={VIDEO_SOURCES.welcome}
            containerClassName="h-[min(328px,40vh)] max-h-[328px]"
            className="pointer-events-none"
          />
        </div>
        <div className="text-center w-full">
          <p className="text-xl text-foreground-light">Seja bem vindo(a)</p>
          <p className="text-3xl font-bold text-foreground">
            {formatUserName(userInfo.name)}
          </p>
        </div>
      </div>
    </div>
  )
}
