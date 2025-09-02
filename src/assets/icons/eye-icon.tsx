import type { IconProps } from '@/types/icons'

export function EyeIcon(props: IconProps) {
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
      <path
        d="M0.832031 9.9987C0.832031 9.9987 4.16536 3.33203 9.9987 3.33203C15.832 3.33203 19.1654 9.9987 19.1654 9.9987C19.1654 9.9987 15.832 16.6654 9.9987 16.6654C4.16536 16.6654 0.832031 9.9987 0.832031 9.9987Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
