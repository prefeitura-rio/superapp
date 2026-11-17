import { ProfileHeaderWrapper } from '@/app/components/profile-header-wrapper'

export default function Loading() {
  return (
    <div className="text-foreground">
      <ProfileHeaderWrapper />
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <h1 className="text-3xl font-medium text-foreground pt-2 pb-2">
          Minhas Solicitações
        </h1>

        <div className="flex flex-col gap-2">
          {/* Pill skeleton */}
          <div className="h-8 w-36 rounded-full bg-muted animate-pulse" />

          {/* Lista skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-8 w-14 rounded-full bg-muted animate-pulse" />
            <div className="h-14 w-full rounded-full bg-muted animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="rounded-2xl bg-card animate-pulse"
                  style={{ height: '132px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
