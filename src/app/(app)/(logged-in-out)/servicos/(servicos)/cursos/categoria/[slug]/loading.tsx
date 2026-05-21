import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import Image from 'next/image'
import Link from 'next/link'

export default function CoursesCategoryLoading() {
  return (
    <div className="min-h-lvh max-w-4xl mx-auto pt-20 md:pt-22 pb-10">
      <SecondaryHeader
        className="max-w-4xl"
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

      <section className="px-4 mt-2">
        <Skeleton className="h-9 w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-3 items-center">
              {/* Course Image Skeleton */}
              <Skeleton className="w-28 h-28 shrink-0 rounded-lg" />

              {/* Course Content Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Course Title Skeleton */}
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />

                {/* Modalidade and Workload Skeleton */}
                <Skeleton className="h-3 w-32" />

                {/* Accessibility Badge Skeleton */}
                <Skeleton className="h-6 w-24 rounded-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
