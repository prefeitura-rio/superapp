import type { IconProps } from '@/types/icons'

export function TrashBinIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-foreground"
      {...props}
    >
      <path
        d="M4 7H6M6 7H9M6 7L7 20H17L18 7M9 7H15M9 7V4H15V7M15 7H18M18 7H20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
