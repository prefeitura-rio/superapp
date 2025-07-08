import { Skeleton } from '@/components/ui/skeleton'

export function SearchResultSkeleton() {
  return (
    <ul className="space-y-2 pt-4">
      {[...Array(5)].map((_, index) => (
        <li
          key={index}
          className="flex justify-between items-center p-4 bg-card rounded-lg"
        >
          <div className="flex-1">
            <Skeleton className="bg-card-foreground/10 h-5 w-[85%] mb-2" />
            <div className="pt-1">
              <Skeleton className="bg-card-foreground/10 h-4 w-full mb-1" />
              <Skeleton className="bg-card-foreground/10 h-4 w-[70%]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
