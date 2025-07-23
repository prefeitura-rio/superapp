export const VIDEO_SOURCES = {
  // Not Found Page
  notFound: {
    lightVideo: '/videos/not-found-light.mp4',
    darkVideo: '/videos/not-found-dark.mp4',
  },

  // Welcome
  welcome: {
    lightVideo: '/videos/welcome-walking-light.mp4',
    darkVideo: '/videos/welcome-walking-dark.mp4',
  },

  // Onboarding Slides
  onboarding: {
    stepOne: {
      lightVideo: '/videos/onboarding-step-one-light.mp4',
      darkVideo: '/videos/onboarding-step-one-dark.mp4',
    },
    stepTwo: {
      lightVideo: '/videos/onboarding-step-two-light.mp4',
      darkVideo: '/videos/onboarding-step-two-dark.mp4',
    },
    stepThree: {
      lightVideo: '/videos/onboarding-step-three-light.mp4',
      darkVideo: '/videos/onboarding-step-three-dark.mp4',
    },
  },

  // Updated User Info
  updatedNumber: {
    lightVideo: '/videos/updated-number-light.mp4',
    darkVideo: '/videos/updated-number-dark.mp4',
  },
  updatedAddress: {
    lightVideo: '/videos/updated-address-light.mp4',
    darkVideo: '/videos/updated-address-dark.mp4',
  },
  updatedEmail: {
    lightVideo: '/videos/updated-email-light.mp4',
    darkVideo: '/videos/updated-email-dark.mp4',
  },
  emptyAddress: {
    lightVideo: '/videos/empty-address-light.mp4',
    darkVideo: '/videos/empty-address-dark.mp4',
  },
}

export type VideoSourceProps = {
  lightVideo: string
  darkVideo: string
}
