export const VIDEO_SOURCES = {
  // Not Found Page
  notFound: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-page-not-found.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-page-not-found.mp4',
  },

  // Welcome
  welcome: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-welcome.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-welcome.mp4',
  },

  // Onboarding Slides
  onboarding: {
    stepOne: {
      lightVideo:
        'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Onboarding-1.mp4',
      darkVideo:
        'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Onboarding-1.mp4',
    },
    stepTwo: {
      lightVideo:
        'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Onboarding-2.mp4',
      darkVideo:
        'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Onboarding-2.mp4',
    },
    stepThree: {
      lightVideo:
        'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Onboarding-3.mp4',
      darkVideo:
        'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Onboarding-3.mp4',
    },
  },

  // Updated User Info
  updatedNumber: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Numero-atualizado.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Numero-atualizado.mp4',
  },
  updatedAddress: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Endere%C3%A7o-atualizado.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Endere%C3%A7o-atualizado.mp4',
  },
  updatedEmail: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Email-atualizado.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Email-atualizado.mp4',
  },
  emptyAddress: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light-Atualiza%C3%A7%C3%A3o-de-endere%C3%A7o.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark-Atualiza%C3%A7%C3%A3o-de-endere%C3%A7o.mp4',
  },
  sessionExpired: {
    lightVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/light/light_sess%C3%A3o%20expirada.mp4',
    darkVideo:
      'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/mp4/dark/dark_sess%C3%A3o%20expirada.mp4',
  },
}

export type VideoSourceProps = {
  lightVideo: string
  darkVideo: string
}
