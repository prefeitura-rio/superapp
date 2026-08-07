import type { IconProps } from '@/types/icons'

export function PlusIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className="text-foreground"
      {...props}
    >
      <path
        d="M10.8 4.5V17.1"
        stroke="currentColor"
        strokeWidth="1.512"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 10.8H17.1"
        stroke="currentColor"
        strokeWidth="1.512"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
