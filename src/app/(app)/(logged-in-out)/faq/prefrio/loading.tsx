import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function FaqPrefRioLoading() {
  return (
    <main
      className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10"
      style={{ paddingTop: 80 }}
    >
      <SecondaryHeader title="FAQ" route="/faq" />
      <div className="p-4 pt-10 max-w-4xl mx-auto">
        <div className="space-y-14">
          {Array.from({ length: 3 }).map((_, sIdx) => (
            <div key={sIdx}>
              <Skeleton className="h-10 w-48 mb-6" />
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full max-w-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    {index < 2 && (
                      <div className="mt-8 border-t border-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
