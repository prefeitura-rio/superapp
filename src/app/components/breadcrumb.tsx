import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Navegação estrutural"
      className={className ?? 'w-full max-w-4xl mx-auto px-4 py-2'}
    >
      <ol className="[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden text-xs font-normal leading-5 tracking-normal">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="inline">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="text-foreground-light select-none mx-1"
                >
                  {'>'}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-foreground"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-foreground-light underline-offset-2 hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
