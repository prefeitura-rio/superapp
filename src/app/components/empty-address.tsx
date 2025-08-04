'use client'

import { PlusIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import Link from 'next/link'

export function EmptyAddress() {
  return (
    <div
      style={{ height: 'calc(100vh - 100px)' }}
      className="flex max-h-[80vh] flex-col overflow-hidden items-center justify-between py-8 px-6 text-center"
    >
      <ThemeAwareVideo
        source={VIDEO_SOURCES.emptyAddress}
        containerClassName="mb-10 flex items-center justify-center  h-[min(328px,40vh)] max-h-[328px]"
      />
      {/* Bottom section with heading and button */}
      <div className="w-full flex flex-col items-center mb-8">
        <h3 className="text-lg font-medium text-card-foreground my-2 leading-5 max-w-xs px-4">
          Não há nenhum endereço cadastrado
        </h3>
        <Button
          asChild
          size="lg"
          className="h-14 w-36.5 bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2 mt-4"
          onClick={() => {}}
        >
          <Link href={'/user-profile/user-address/address-form'}>
            <PlusIcon className="w-5 h-5 text-white" />
            Adicionar
          </Link>
        </Button>
      </div>
    </div>
  )
}
