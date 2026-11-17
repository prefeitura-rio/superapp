import type { IconProps } from '@/types/icons'

export function HeartPulseIcon(props: IconProps) {
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
        d="M12.0001 7.19401C10.2701 3.27401 6.24006 2.96401 4.36006 4.63401C2.83006 5.96401 2.10006 9.29401 3.49006 12.324C5.90006 17.534 12.0001 20.324 12.0001 20.324C12.0001 20.324 18.1001 17.584 20.5101 12.374C21.9001 9.37401 21.1701 6.05401 19.6401 4.68401C17.7601 2.96401 13.7301 3.27401 12.0001 7.19401Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.34009 11.964H8.00009L11.0001 14.964L14.0001 8.96399L16.0001 11.964H20.6601"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
