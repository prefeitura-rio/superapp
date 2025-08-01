'use client'

import { useEffect, useRef, useState } from 'react'

interface RecaptchaEnterpriseProps {
  onTokenReceived: (token: string) => void
  onError: (error: string) => void
  action: string
  siteKey: string
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        render: (container: string | HTMLElement, options: any) => number
        execute: (widgetId?: number) => void
        ready: (callback: () => void) => void
      }
    }
    g_rt: string | null
  }
}

export function RecaptchaEnterprise({
  onTokenReceived,
  onError,
  action,
  siteKey,
}: RecaptchaEnterpriseProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [widgetId, setWidgetId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if reCAPTCHA script is already loaded
    if (
      typeof window.grecaptcha !== 'undefined' &&
      window.grecaptcha.enterprise
    ) {
      setIsLoaded(true)
      return
    }

    // Wait for the script to load from the layout
    const checkRecaptcha = () => {
      if (
        typeof window.grecaptcha !== 'undefined' &&
        window.grecaptcha.enterprise
      ) {
        setIsLoaded(true)
      } else {
        setTimeout(checkRecaptcha, 100)
      }
    }

    checkRecaptcha()
  }, [])

  useEffect(() => {
    if (!isLoaded || !containerRef.current) {
      console.log('reCAPTCHA: waiting for container or script to load')
      return
    }

    // Wait a bit more for grecaptcha to be fully ready
    const initializeRecaptcha = () => {
      if (
        typeof window.grecaptcha === 'undefined' ||
        !window.grecaptcha.enterprise
      ) {
        setTimeout(initializeRecaptcha, 100)
        return
      }

      // Ensure container is in DOM
      if (!containerRef.current || !document.contains(containerRef.current)) {
        console.log('reCAPTCHA: container not in DOM yet')
        setTimeout(initializeRecaptcha, 100)
        return
      }

      try {
        window.grecaptcha.enterprise.ready(() => {
          try {
            const id = window.grecaptcha.enterprise.render(
              containerRef.current!,
              {
                sitekey: siteKey,
                action: action,
                size: 'invisible',
                callback: (token: string) => {
                  window.g_rt = token
                  onTokenReceived(token)
                },
                'expired-callback': () => {
                  window.g_rt = null
                  onError('reCAPTCHA token expired')
                },
                'error-callback': () => {
                  window.g_rt = null
                  onError('reCAPTCHA error occurred')
                },
              }
            )
            setWidgetId(id)
            console.log('reCAPTCHA rendered successfully with widget ID:', id)
          } catch (error) {
            console.error('reCAPTCHA render error:', error)
            onError('Failed to render reCAPTCHA')
          }
        })
      } catch (error) {
        console.error('reCAPTCHA ready error:', error)
        onError('Failed to initialize reCAPTCHA')
      }
    }

    initializeRecaptcha()
  }, [isLoaded, siteKey, action, onTokenReceived, onError])

  // Expose execute function globally for external calls
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).executeRecaptcha = () => {
        if (widgetId !== null && window.grecaptcha?.enterprise) {
          window.g_rt = null
          try {
            window.grecaptcha.enterprise.execute(widgetId)
            console.log('reCAPTCHA execute called for widget:', widgetId)
          } catch (error) {
            console.error('reCAPTCHA execute error:', error)
          }
        } else {
          console.warn('reCAPTCHA not ready for execution, widgetId:', widgetId)
        }
      }
    }
  }, [widgetId])

  // Auto-execute reCAPTCHA when widget is ready
  useEffect(() => {
    if (widgetId !== null) {
      // Small delay to ensure widget is fully rendered
      const timer = setTimeout(() => {
        if ((window as any).executeRecaptcha) {
          ;(window as any).executeRecaptcha()
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [widgetId])

  // Target the specific reCAPTCHA div and iframe structure
  useEffect(() => {
    let isProtected = false
    let eventListeners: Array<{
      element: Element
      type: string
      handler: EventListener
    }> = []

    const checkForModal = () => {
      const modal = document.querySelector(
        'iframe[src*="recaptcha/enterprise/bframe"]'
      )
      if (modal && !isProtected) {
        // Add CSS to block all interactions
        const style = document.createElement('style')
        style.id = 'recaptcha-protection'
        style.textContent = `
          *:not(iframe[src*="recaptcha/enterprise/bframe"]):not(iframe[src*="recaptcha/enterprise/bframe"] *) {
            pointer-events: none !important;
            user-select: none !important;
          }
          iframe[src*="recaptcha/enterprise/bframe"] {
            pointer-events: auto !important;
          }
          body {
            overflow: hidden !important;
          }
        `
        document.head.appendChild(style)

        // Add event listeners to prevent any interactions
        const preventInteraction = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }

        // Add listeners to common interactive elements
        const interactiveSelectors = [
          'button',
          'a',
          'input',
          'select',
          'textarea',
          'label',
          'div[role="button"]',
          'div[tabindex]',
          '[onclick]',
        ]

        for (const selector of interactiveSelectors) {
          const elements = document.querySelectorAll(selector)
          for (const element of elements) {
            const events = [
              'click',
              'mousedown',
              'mouseup',
              'touchstart',
              'touchend',
            ]
            for (const eventType of events) {
              element.addEventListener(eventType, preventInteraction, {
                capture: true,
                passive: false,
              })
              eventListeners.push({
                element,
                type: eventType,
                handler: preventInteraction,
              })
            }
          }
        }

        console.log('reCAPTCHA: Applied CSS and event listener protection')
        isProtected = true
      } else if (!modal && isProtected) {
        // Remove CSS protection
        const style = document.getElementById('recaptcha-protection')
        if (style) {
          style.remove()
        }

        // Remove event listeners
        for (const { element, type, handler } of eventListeners) {
          element.removeEventListener(type, handler, { capture: true })
        }
        eventListeners = []

        console.log('reCAPTCHA: Removed CSS and event listener protection')
        isProtected = false
      }
    }

    // Check periodically for modal
    const interval = setInterval(checkForModal, 100)

    return () => {
      clearInterval(interval)
      // Cleanup on unmount
      const style = document.getElementById('recaptcha-protection')
      if (style) {
        style.remove()
      }
      for (const { element, type, handler } of eventListeners) {
        element.removeEventListener(type, handler, { capture: true })
      }
    }
  }, [])

  return (
    <>
      <div ref={containerRef} />
      <style jsx global>{`
        /* Target the specific reCAPTCHA div and iframe structure */
        iframe[src*="recaptcha/enterprise/bframe"] {
          pointer-events: auto !important;
        }
        
        /* Disable pointer events on the reCAPTCHA container div */
        div:has(iframe[src*="recaptcha/enterprise/bframe"]) {
          pointer-events: none !important;
        }
        
        /* Prevent body scrolling when modal is active */
        body:has(iframe[src*="recaptcha/enterprise/bframe"]) {
          overflow: hidden !important;
        }
      `}</style>
    </>
  )
}

export async function executeRecaptchaAndWait(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('reCAPTCHA not available on server side'))
      return
    }

    // Reset token
    window.g_rt = null

    // Wait for reCAPTCHA to be ready
    const waitForRecaptcha = () => {
      if ((window as any).executeRecaptcha && window.grecaptcha?.enterprise) {
        try {
          ;(window as any).executeRecaptcha()
          console.log('reCAPTCHA execution started')
        } catch (error) {
          console.error('reCAPTCHA execution error:', error)
          reject(new Error('reCAPTCHA execution failed'))
          return
        }

        // Wait for token
        const checkToken = () => {
          if (window.g_rt) {
            console.log('reCAPTCHA token received')
            resolve(window.g_rt)
          } else {
            setTimeout(checkToken, 50)
          }
        }

        checkToken()
      } else {
        console.log('reCAPTCHA not ready yet, retrying...')
        setTimeout(waitForRecaptcha, 100)
      }
    }

    waitForRecaptcha()
  })
}
