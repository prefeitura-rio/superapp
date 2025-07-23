import {
  VIDEO_SOURCES,
  type VideoSourceProps,
} from '@/constants/videos-sources'

export interface OnboardingSlide {
  title: string
  description: string
  videoSource: VideoSourceProps
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    title: 'O Rio inteiro em um só app',
    description:
      'Consulte IPTU e ITBI, gere certidões, agende atendimentos e muito mais – sem burocracia.',
    videoSource: VIDEO_SOURCES.onboarding.stepOne,
  },
  {
    title: 'Serviços municipais a seu alcance',
    description:
      'Marque consultas médicas, confira frequência escolar, consulte seus impostos e muito mais.',
    videoSource: VIDEO_SOURCES.onboarding.stepTwo,
  },
  {
    title: 'Sua cidadania na palma da mão',
    description:
      'Acesse o Bolsa Família, Cartão Saúde e Zeladoria num só lugar – simples, digital e seguro.',
    videoSource: VIDEO_SOURCES.onboarding.stepThree,
  },
]
