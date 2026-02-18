'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VIDEO_SOURCES } from '@/constants/videos-sources'

interface CandidaturaEnviadaDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Se false, não permite fechar pelo backdrop/gesto (ex: fluxo perguntas-adicionais). */
  dismissible?: boolean
}

export function CandidaturaEnviadaDrawer({
  open,
  onOpenChange,
  dismissible = true,
}: CandidaturaEnviadaDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal dismissible={dismissible}>
      <DrawerHeader className="sr-only">
        <DrawerTitle className="sr-only">
          Candidatura enviada e currículo atualizado
        </DrawerTitle>
      </DrawerHeader>
      <DrawerContent className="max-w-none mx-auto rounded-t-none min-h-screen 3xl:justify-center flex flex-col">
        <div className="flex flex-col min-h-screen 3xl:min-h-[70vh] justify-between bg-background px-4 py-12 max-w-4xl mx-auto w-full">
          <div className="flex flex-col flex-1 gap-6">
            <ThemeAwareVideo
              source={VIDEO_SOURCES.jobApplicationSuccess}
              containerClassName="flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
            />

            <div className="flex flex-col text-left">
              <h2 className="text-foreground text-4xl font-medium leading-10">
                Candidatura enviada e currículo atualizado
              </h2>

              <p className="text-foreground-light text-sm font-normal leading-5">
                Obrigado por submeter sua candidatura! Ela será analisada e você
                receberá uma resposta por e-mail ou WhatsApp.
              </p>
            </div>
          </div>

          <CustomButton
            size="xl"
            fullWidth
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Voltar para a tela inicial
          </CustomButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
