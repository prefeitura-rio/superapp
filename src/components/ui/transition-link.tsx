'use client'

import { usePageTransition } from '@/contexts/page-transition-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

interface Props extends React.ComponentProps<typeof Link> {
  direction?: 'forward' | 'backward'
}

export function TransitionLink({
  direction = 'forward',
  href,
  onClick,
  ...rest
}: Props) {
  const { setDirection } = usePageTransition()
  const router = useRouter()

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    setDirection(direction)

    if (onClick) onClick(e)

    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey
    ) {
      e.preventDefault()
      router.push(typeof href === 'string' ? href : href.toString())
    }
  }

  return <Link href={href} {...rest} onClick={handleClick} />
}
