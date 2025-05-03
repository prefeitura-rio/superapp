import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InfoIcon } from 'lucide-react'
import { SecondaryHeader } from '../../components/secondary-header'

export default function PersonalInfoForm() {
  return (
    <>
      <div className="min-h-screen max-w-md mx-auto pt-20 bg-background">
        <SecondaryHeader title="Informações pessoais" />
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-blue-400">
              CPF
            </Label>
            <Input
              id="cpf"
              defaultValue="123.456.789-12"
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-blue-400">
              Nome completo
            </Label>
            <Input
              id="fullName"
              defaultValue="Marina Duarte"
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="socialName" className="text-blue-400">
                Nome social
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Nome pelo qual a pessoa prefere ser chamada socialmente
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="socialName"
              defaultValue="Marina Duarte"
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-blue-400">
              Nacionalidade
            </Label>
            <Input
              id="nationality"
              defaultValue="Brasileira"
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="race" className="text-blue-400">
              Raça / cor
            </Label>
            <Input
              id="race"
              defaultValue="Branca"
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-blue-400">
              Data de nascimento
            </Label>
            <Input
              id="birthDate"
              defaultValue="25/09/1992"
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
        </div>
      </div>
    </>
  )
}
