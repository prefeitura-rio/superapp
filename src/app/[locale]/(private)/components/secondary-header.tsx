'use client'

import { IconButton } from '@/components/ui/custom/icon-button'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SecondaryHeaderProps {
  title: string
}

export function SecondaryHeader({ title }: SecondaryHeaderProps) {
  const router = useRouter()

  return (
    <>
      <header className="p-4 pt-6 fixed top-0 flex items-center w-full justify-center max-w-md mx-auto z-50 bg-background text-foreground h-16">
        <IconButton icon={ChevronLeft} onClick={() => router.back()} />
        <h1 className="text-xl font-medium w-full text-center flex items-center justify-center h-full text-foreground">
          {title}
        </h1>
      </header>

      {/* <div className="fixed top-16 w-full max-w-md mx-auto h-15 z-40 pointer-events-none">
        <div
          className="w-full h-full bg-background backdrop-blur-lg"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          }}
        />
      </div> */}
    </>
  )
}
