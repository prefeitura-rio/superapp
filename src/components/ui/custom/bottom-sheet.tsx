import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: React.ReactNode
  showHandle?: boolean
  className?: string
  contentClassName?: string
  headerClassName?: string
  footerClassName?: string
}

export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (
    {
      open,
      onOpenChange,
      children,
      title,
      showHandle = true,
      className,
      contentClassName,
      headerClassName,
      footerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          ref={ref}
          className={cn(
            'p-6 max-w-4xl mx-auto !rounded-t-3xl',
            contentClassName
          )}
          {...props}
        >
          {/* Handle */}
          {showHandle && (
            <div className="flex justify-center  pb-1">
              <div className="w-8.5 h-1 rounded-full bg-popover-line" />
            </div>
          )}

          {/* Header */}
          {title && (
            <DrawerHeader className={cn('sr-only', headerClassName)}>
              <DrawerTitle className="sr-only">{title}</DrawerTitle>
            </DrawerHeader>
          )}

          {/* Content */}
          <div className={cn('flex-1', className)}>{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }
)

BottomSheet.displayName = 'BottomSheet'

export const BottomSheetFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DrawerFooter
    className={cn('flex-row gap-3 pb-4 px-4 md:px-10', className)}
    {...props}
  >
    {children}
  </DrawerFooter>
)

export const BottomSheetClose = DrawerClose
