import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import Image from 'next/image'
import Link from 'next/link'

export default function CoursesOptionsLoading() {
  return (
    <div className="pb-25 pt-20 max-w-4xl mx-auto text-white flex flex-col">
      <SecondaryHeader
        route="/servicos/cursos"
        logo={
          <Link href="/servicos/cursos">
            <Image
              src={oportunidadesCariocasLogoDark}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:block hidden"
            />
            <Image
              src={oportunidadesCariocasLogo}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              priority
              className="dark:hidden block"
            />
          </Link>
        }
      />

      <div className="flex-1 px-4">
        <Skeleton className="h-9 w-20 mb-2 pt-3" />
        <nav className="space-y-1">
          {/* Menu Item 1 - Meus cursos */}
          <div className="flex items-center justify-between py-5 text-foreground border-b border-border">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <div className="flex flex-col">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-5" />
          </div>

          {/* Menu Item 2 - Certificados */}
          <div className="flex items-center justify-between py-5 text-foreground border-b border-border">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <div className="flex flex-col">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-5" />
          </div>

          {/* Menu Item 3 - FAQ */}
          <div className="flex items-center justify-between py-5 text-foreground">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <div className="flex flex-col">
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        </nav>
      </div>
    </div>
  )
}
