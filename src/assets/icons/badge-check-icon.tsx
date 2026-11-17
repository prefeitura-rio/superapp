import type { IconProps } from '@/types/icons'

export function BadgeCheckIcon(props: IconProps) {
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
        d="M12 3L14.5 5L17.7 4.7L18.2 7.9L21 9.5L19.6 12.4L21 15.3L18.2 16.9L17.7 20.1L14.5 19.8L12 21L9.5 19L6.3 19.3L5.8 16.1L3 14.5L4.4 11.6L3 8.7L5.8 7.1L6.3 3.9L9.5 4.2L12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12L11 14.5L15.5 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
