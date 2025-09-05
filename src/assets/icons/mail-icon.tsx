import type { IconProps } from '@/types/icons'

export function MailIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="text-foreground"
      {...props}
    >
      <path
        d="M3.33268 3.33203H16.666C17.5827 3.33203 18.3327 4.08203 18.3327 4.9987V14.9987C18.3327 15.9154 17.5827 16.6654 16.666 16.6654H3.33268C2.41602 16.6654 1.66602 15.9154 1.66602 14.9987V4.9987C1.66602 4.08203 2.41602 3.33203 3.33268 3.33203Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3327 5L9.99935 10.8333L1.66602 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
