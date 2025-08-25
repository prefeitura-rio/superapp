import type { IconProps } from '@/types/icons'

export function FilterIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      className="text-foreground"
      {...props}
    >
      <path
        d="M9.5 3H16.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="2.2"
        y="0.7"
        width="4.6"
        height="4.6"
        rx="0.9"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8.5 11L1.5 11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="15.8"
        y="13.3"
        width="4.6"
        height="4.6"
        rx="0.9"
        transform="rotate(180 15.8 13.3)"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}
