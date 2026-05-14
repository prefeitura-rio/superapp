import type { IconProps } from '@/types/icons'

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-foreground"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10 3.5H2C1.44772 3.5 1 3.94772 1 4.5V9.5C1 10.0523 1.44772 10.5 2 10.5H10C10.5523 10.5 11 10.0523 11 9.5V4.5C11 3.94772 10.5523 3.5 10 3.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.5V2.5C8 2.23478 7.89464 1.98043 7.70711 1.79289C7.51957 1.60536 7.26522 1.5 7 1.5H5C4.73478 1.5 4.48043 1.60536 4.29289 1.79289C4.10536 1.98043 4 2.23478 4 2.5V3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
