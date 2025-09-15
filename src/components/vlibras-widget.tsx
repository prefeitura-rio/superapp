'use client'

import VLibras from 'vlibras-nextjs'

export const VLibrasWidget = () => {

  return (
    <>
    {process.env.NODE_ENV === 'production' && <VLibras forceOnload />}
    </>
  )
}
