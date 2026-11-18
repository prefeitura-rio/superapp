import type { IconProps } from '@/types/icons'

export function LuggageIcon(props: IconProps) {
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
        d="M4.41296 11.624C3.94741 13.7468 3.87454 15.9369 4.19796 18.086C4.44396 19.726 4.56796 20.547 5.41096 21.274C6.25496 22 7.27696 22 9.32196 22H14.678C16.723 22 17.745 22 18.588 21.274C19.433 20.547 19.556 19.727 19.803 18.086C20.1261 15.9369 20.0528 13.7468 19.587 11.624C19.25 10.091 19.081 9.324 18.258 8.662C17.435 8 16.468 8 14.533 8H9.46796C7.53296 8 6.56496 8 5.74196 8.662C4.91896 9.324 4.75096 10.09 4.41296 11.624Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 2H14M14 2H20M14 2L12 5.5M12 5.5H9M12 5.5H15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 16H12M12 16H19.5M12 16V9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
