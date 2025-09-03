import type { IconProps } from '@/types/icons'

export function MessageCircleIcon(props: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
      {...props}
    >
      <path
        d="M19.1 10.5485C19.1031 11.7363 18.8256 12.9082 18.29 13.9685C17.655 15.239 16.6788 16.3077 15.4707 17.0548C14.2627 17.8019 12.8704 18.1979 11.45 18.1985C10.2621 18.2016 9.09033 17.924 8.03002 17.3885L2.90002 19.0985L4.61002 13.9685C4.07446 12.9082 3.79693 11.7363 3.80002 10.5485C3.80057 9.12804 4.19658 7.73583 4.94367 6.52776C5.69077 5.31969 6.75945 4.34347 8.03002 3.70846C9.09033 3.1729 10.2621 2.89537 11.45 2.89846H11.9C13.7759 3.00196 15.5478 3.79375 16.8763 5.12224C18.2047 6.45072 18.9965 8.22255 19.1 10.0985V10.5485Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
