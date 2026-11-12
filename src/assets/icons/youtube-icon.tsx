import type { IconProps } from '@/types/icons'

export function YoutubeIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M17.5 5.5H6.5C4.29086 5.5 2.5 7.29086 2.5 9.5V14.5C2.5 16.7091 4.29086 18.5 6.5 18.5H17.5C19.7091 18.5 21.5 16.7091 21.5 14.5V9.5C21.5 7.29086 19.7091 5.5 17.5 5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 9.5L14.5 12L10 14.5V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
