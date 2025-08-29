'use client'

// import { BottomSheet } from '@/components/ui/bottom-sheet'
// import { MenuItem } from '@/components/ui/menu-item'
import {
  DownloadCloudIcon,
  EyeOffIcon,
  PrinterCheckIcon,
  Share2Icon,
} from 'lucide-react'
import { BottomSheet } from '../../../components/ui/custom/bottom-sheet'
import { MenuItem } from '../menu-item'

interface CoursesCertifiedDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseTitle: string
}

interface CoursesUnavailableDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoursesCertifiedDrawer({
  open,
  onOpenChange,
  courseTitle,
}: CoursesCertifiedDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={courseTitle}
      headerClassName="text-left p-0 mb-6"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-2 pt-5 font-medium leading-6 text-popover-foreground">
            Parabéns! Você concluiu o curso e já pode baixar o seu certificado.
          </h2>
          <div>
            <p className="text-sm text-foreground mb-1 leading-5 pt-3">Curso</p>
            <p className="text-sm leading-5 text-muted-foreground">
              {courseTitle}
            </p>
          </div>
        </div>

        <div className="space-y-0">
          <MenuItem
            icon={<DownloadCloudIcon className="h-5 w-5" />}
            label="Baixar"
            href="#"
            isFirst
          />
          <MenuItem
            icon={<Share2Icon className="h-5 w-5" />}
            label="Compartilhar"
            href="#"
          />
          <MenuItem
            icon={<EyeOffIcon className="h-5 w-5" />}
            label="Visualizar"
            href="#"
          />
          <MenuItem
            icon={<PrinterCheckIcon className="h-5 w-5" />}
            label="Imprimir"
            href="#"
            isLast
          />
        </div>
      </div>
    </BottomSheet>
  )
}

export function CoursesUnavailableDrawer({
  open,
  onOpenChange,
}: CoursesUnavailableDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Certificado Indisponível"
      headerClassName="text-center p-0 mb-6"
    >
      <div className="text-left py-4">
        <p className="text-sm text-popover-foreground leading-5">
          O certificado ainda não está disponível. Conclua o curso para
          acessá-lo.
        </p>
      </div>
    </BottomSheet>
  )
}
