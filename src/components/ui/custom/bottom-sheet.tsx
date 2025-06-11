import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  showHandle?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
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
          className={cn('p-4 max-w-md mx-auto !rounded-t-3xl', contentClassName)}
          {...props}
        >
          {/* Handle */}
          {showHandle && <div className="mx-auto mb-4 h-1 w-6 rounded-full bg-[#323232]" />}

          {/* Header */}
          {title && (
            <DrawerHeader className={cn('text-center px-4', headerClassName)}>
              <DrawerTitle className="text-md">{title}</DrawerTitle>
            </DrawerHeader>
          )}

          {/* Content */}
          <div className={cn('flex-1', className)}>{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export const BottomSheetFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DrawerFooter className={cn('flex-row gap-3 pb-10 px-4 md:px-10', className)} {...props}>
    {children}
  </DrawerFooter>
);

export const BottomSheetClose = DrawerClose;
