import type { IconProps } from '@/types/icons'

export function CitizenshipIcon(props: IconProps) {
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
        d="M12.5 8C12.5 9.933 10.933 11.5 9 11.5C7.067 11.5 5.5 9.933 5.5 8C5.5 6.067 7.067 4.5 9 4.5C10.933 4.5 12.5 6.067 12.5 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 20C2.5 16.4 5.4 14 9 14C12.6 14 15.5 16.4 15.5 20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 4.5C16.9283 4.5 17.8185 4.86875 18.4749 5.52513C19.1313 6.1815 19.5 7.07174 19.5 8C19.5 8.92826 19.1313 9.8185 18.4749 10.4749C17.8185 11.1313 16.9283 11.5 16 11.5M21.5 20C21.5 17.4 20 15.4 17.7 14.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
