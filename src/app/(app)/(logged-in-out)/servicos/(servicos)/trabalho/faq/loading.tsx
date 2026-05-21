import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import Image from 'next/image'
import Link from 'next/link'

export default function FaqCoursesLoading() {
  return (
    <main className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10">
      <SecondaryHeader
        fixed={false}
        route="/servicos/trabalho"
        logo={
          <Link href="/servicos/trabalho">
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
      <div className="p-5 pt-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium text-foreground pb-4">FAQ</h1>
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <div className="space-y-2">
                {/* Title skeleton */}
                <Skeleton className="h-6 w-full max-w-md" />
                {/* Content skeleton - multiple lines */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              {index < 4 && <div className="mt-8 border-t border-border" />}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
