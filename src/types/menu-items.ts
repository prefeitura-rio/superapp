export interface MenuItemProps {
  icon?: React.ReactNode
  label: string
  title?: string
  href?: string
  variant?: 'default' | 'danger'
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void
  isFirst?: boolean
  isLast?: boolean
  disabled?: boolean
  className?: string
}
