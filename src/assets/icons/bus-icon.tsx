import type { IconProps } from '@/types/icons'

export function BusIcon(props: IconProps) {
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
        d="M17.5 19V22M6.5 19V22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 10C4 6.229 4 4.343 5.172 3.172C6.344 2.001 8.229 2 12 2C15.771 2 17.657 2 18.828 3.172C19.999 4.344 20 6.229 20 10V13C20 15.828 20 17.243 19.121 18.121C18.243 19 16.828 19 14 19H10C7.172 19 5.757 19 4.879 18.121C4 17.243 4 15.828 4 13V10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 16H8M16 16H17M2 8V10M22 8V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 5H19.5M4.5 13H19.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
