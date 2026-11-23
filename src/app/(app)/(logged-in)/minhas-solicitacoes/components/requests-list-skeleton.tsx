/**
 * Skeleton da lista (abas + cards). É o mesmo da rota (`loading.tsx`) e da
 * primeira carga do histórico SGRC, para a troca de um pelo outro não piscar.
 */
export function RequestsListSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Carregando solicitações…</span>
      <div className="h-8 w-14 rounded-full bg-muted animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-33 rounded-2xl bg-card animate-pulse" />
        ))}
      </div>
    </div>
  )
}
