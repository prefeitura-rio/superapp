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
      } bg-white`}
      style={{
        animation: show && !fadeOut ? 'fadeIn 600ms ease-in-out' : undefined,
      }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full px-4">
        <div className="mb-12">
          <video
            width={193}
            height={342}
            style={{ objectFit: 'contain' }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="pointer-events-none"
          >
            <source src="/onboarding/walkingWelcomePage.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
        </div>
        <div className="text-center w-full">
          <p className="text-xl text-[#71717B]">Seja bem vindo(a)</p>
          <p className="text-3xl font-bold text-[#09090B]">{userInfo.name}</p>
        </div>
      </div>
    </div>
  )
}
