import type { IconProps } from '@/types/icons'

export function PrinterIcon(props: IconProps) {
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
      <g clipPath="url(#clip0_9466_23409)">
        <path
          d="M5 7.5013V1.66797H15V7.5013"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.0013 15H3.33464C2.89261 15 2.46868 14.8244 2.15612 14.5118C1.84356 14.1993 1.66797 13.7754 1.66797 13.3333V9.16667C1.66797 8.72464 1.84356 8.30072 2.15612 7.98816C2.46868 7.6756 2.89261 7.5 3.33464 7.5H16.668C17.11 7.5 17.5339 7.6756 17.8465 7.98816C18.159 8.30072 18.3346 8.72464 18.3346 9.16667V13.3333C18.3346 13.7754 18.159 14.1993 17.8465 14.5118C17.5339 14.8244 17.11 15 16.668 15H15.0013"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 11.668H5V18.3346H15V11.668Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_9466_23409">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
