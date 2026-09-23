
import { Skeleton } from '@/components/ui/skeleton'

export default function EmpregosMenuLoading() {
  return (
    <main className="max-w-4xl mx-auto text-foreground pb-10">

      <div className="px-4 pt-3.4">
        {/* Menu Item 1 - Minhas candidaturas */}
        <div className="flex items-center justify-between py-5 text-foreground border-b border-border">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-5" />
        </div>

        {/* Menu Item 2 - Meu currículo */}
        <div className="flex items-center justify-between py-5 text-foreground border-b border-border">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-5" />
        </div>

        {/* Menu Item 3 - FAQ */}
        <div className="flex items-center justify-between py-5 text-foreground">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </main>
  )
}
