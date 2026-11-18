import type { IconProps } from '@/types/icons'

export function FileSearchIcon(props: IconProps) {
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
        d="M11 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V4C4 3.46957 4.21071 2.96086 4.58579 2.58579C4.96086 2.21071 5.46957 2 6 2H14L20 8V11M20 8H14V2M21 22L18 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 16.5C19 18.433 17.433 20 15.5 20C13.567 20 12 18.433 12 16.5C12 14.567 13.567 13 15.5 13C17.433 13 19 14.567 19 16.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
