export function SearchResultSkeleton() {
  return (
    <div className="space-y-5 pt-5">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-5 bg-gray-700 rounded w-[95%] mb-2" />
          <div className="flex gap-2 items-center">
            <div className="h-3 bg-gray-700 rounded w-1/4" />
            <span className="text-gray-500 text-xs">{'>'}</span>
            <div className="h-3 bg-gray-700 rounded w-1/4" />
            <span className="text-gray-500 text-xs">{'>'}</span>
            <div className="h-3 bg-gray-700 rounded w-1/4" />
          </div>
          {index < 2 && <div className="border-b border-neutral-800 my-4" />}
        </div>
      ))}
    </div>
  )
}
