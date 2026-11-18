import type { IconProps } from '@/types/icons'

export function MessageBubbleIcon(props: IconProps) {
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
        d="M21 12C20.9925 13.362 20.6373 14.6995 19.9682 15.8859C19.2991 17.0722 18.3382 18.0681 17.1765 18.7792C16.0148 19.4902 14.6908 19.8929 13.3299 19.949C11.969 20.0052 10.6163 19.7129 9.4 19.1L4 20L5.1 15.4C4.87675 14.356 4.86132 13.2782 5.0546 12.2282C5.24787 11.1783 5.64605 10.1766 6.22642 9.28056C6.80679 8.38448 7.55797 7.61148 8.43707 7.0057C9.31618 6.39992 10.306 5.97323 11.35 5.74998C12.394 5.52673 13.4718 5.51131 14.5217 5.70458C15.5717 5.89785 16.5733 6.29603 17.4694 6.8764C18.3655 7.45677 19.1385 8.20795 19.7443 9.08705C20.3501 9.96616 20.7768 10.956 21 12Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
