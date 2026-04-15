import { Skeleton } from '@/components/ui/skeleton'

export default function EmpregosMenuLoading() {
  return (
    <main className="max-w-xl min-h-lvh mx-auto text-foreground pb-10">
      <header className="px-4 py-4 w-full max-w-xl mx-auto z-50 bg-background text-foreground">
        <div className="flex justify-start">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
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
