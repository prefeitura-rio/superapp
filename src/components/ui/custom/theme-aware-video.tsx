'use client'

import type { SourceVideosProps } from '@/constants/videos-sources'
import { useTheme } from 'next-themes'
import React, { useState } from 'react'

interface ThemeAwareVideoProps {
  source: SourceVideosProps
  className?: string
  style?: React.CSSProperties
  containerClassName?: string
}

export function ThemeAwareVideo({
  source,
  className = '',
  style = {},
  containerClassName = 'mb-4 relative',
}: ThemeAwareVideoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { lightVideo, darkVideo } = source

  // Aguarda hidratação para evitar mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Fallback for SSR
  const getVideoSource = () => {
    // Hydration check
    if (!mounted) return ''

    // If Next.js Theme Provider is used
    if (resolvedTheme) {
      return resolvedTheme === 'dark' ? darkVideo : lightVideo
    }

    // Web Browser prefers-color-scheme
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      return prefersDark ? darkVideo : lightVideo
    }

    // Final Fallback
    return lightVideo
  }

  const videoSource = getVideoSource()

  // Handler
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const fallback = video.parentElement?.querySelector('[data-fallback]')

    if (video && fallback instanceof HTMLElement) {
      video.style.display = 'none'
      fallback.style.display = 'flex'
    }
  }

  const defaultVideoStyle: React.CSSProperties = {
    objectFit: 'contain',
    width: '100%',
    height: '100%',
    ...style,
  }

  if (!mounted) {
    return <div className={`bg-background ${containerClassName}`} />
  }

  return (
    <div className={containerClassName}>
      <video
        key={videoSource}
        src={videoSource}
        className={className}
        style={defaultVideoStyle}
        loop
        autoPlay
        muted
        playsInline
        onError={handleError}
      />

      {/* Fallback Unavailable video */}
      <div
        data-fallback
        className="inset-0 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-center p-4 h-[300px] w-[300px]"
        style={{ display: 'none' }}
      >
        <div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-xl ml-1 -mt-1">
              ▶
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Vídeo indisponível
          </p>
        </div>
      </div>
    </div>
  )
}
