import type { IconProps } from '@/types/icons'

export function LockIcon(props: IconProps) {
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
        d="M6 10H18C19.1046 10 20 10.8954 20 12V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V12C4 10.8954 4.89543 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10V7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
