'use client'

import { useEffect, useRef, useState } from 'react'
import MainHeader from './main-header'
import SearchPlaceholder from './search-placeholder'

interface ScrollAwareHeaderProps {
  userName: string
}

export default function ScrollAwareHeader({
  userName,
}: ScrollAwareHeaderProps) {
  const [showSearchIcon, setShowSearchIcon] = useState(false)
  const searchPlaceholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleScroll() {
      if (!searchPlaceholderRef.current) return

      const searchPlaceholderRect =
        searchPlaceholderRef.current.getBoundingClientRect()

      // Fixed header height calculation - assuming the header is about 80px tall
      // We can also calculate this dynamically if needed
      const HEADER_HEIGHT = 105

      // Show search icon when SearchPlaceholder is completely scrolled behind the header
      const searchPlaceholderBottom = searchPlaceholderRect.bottom

      // SearchIcon should appear when SearchPlaceholder is completely scrolled behind the header
      const shouldShowSearchIcon = searchPlaceholderBottom < HEADER_HEIGHT

      // // Debug logging
      // console.log('Scroll Debug:', {
      //   HEADER_HEIGHT,
      //   searchPlaceholderBottom,
      //   searchPlaceholderTop: searchPlaceholderRect.top,
      //   shouldShowSearchIcon,
      //   currentShowSearchIcon: showSearchIcon,
      // })

      setShowSearchIcon(shouldShowSearchIcon)
    }

    // Initial check
    handleScroll()

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <MainHeader userName={userName} showSearchIcon={showSearchIcon} />

      <div ref={searchPlaceholderRef}>
        <SearchPlaceholder />
      </div>
    </>
  )
}
