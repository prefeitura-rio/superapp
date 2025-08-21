'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

interface CollapsibleTextProps {
  text: string
}

export function CollapsibleText({ text }: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current
        setNeedsTruncation(element.scrollHeight > element.clientHeight)
      }
    }

    checkTruncation()
    // Re-check on window resize
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [])

  return (
    <div className="">
      <p
        ref={textRef}
        className={`text-sm text-foreground-light leading-5 ${
          isExpanded ? '' : 'line-clamp-5'
        }`}
      >
        {text}
      </p>
      {needsTruncation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto font-medium p-0 text-primary/80 hover:bg-transparent hover:text-primary hover:cursor-pointer"
        >
          {isExpanded ? 'Ler menos' : 'Ler mais'}
        </Button>
      )}
    </div>
  )
}
