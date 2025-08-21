import type { IconProps } from '@/types/icons'

interface BookmarkIconProps extends IconProps {
  isSaved?: boolean
}

export function BookmarkIcon(props: BookmarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="2 2 16 16"
      className="text-foreground h-10 w-10"
      fill={props.isSaved ? 'currentColor' : 'none'}
      stroke="currentColor"
    >
      <path
        d="M15.8337 17.5L10.0003 13.3333L4.16699 17.5V4.16667C4.16699 3.72464 4.34259 3.30072 4.65515 2.98816C4.96771 2.67559 5.39163 2.5 5.83366 2.5H14.167C14.609 2.5 15.0329 2.67559 15.3455 2.98816C15.6581 3.30072 15.8337 3.72464 15.8337 4.16667V17.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
