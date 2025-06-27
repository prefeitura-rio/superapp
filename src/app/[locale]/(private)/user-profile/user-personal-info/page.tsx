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
      <div className="min-h-screen max-w-md mx-auto pt-24 pb-10 bg-background">
        <SecondaryHeader title="Informações pessoais" />
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-primary">
              CPF
            </Label>
            <Input
              id="cpf"
              defaultValue="123.456.789-12"
              className="bg-transparent border-muted text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-primary">
              Nome completo
            </Label>
            <Input
              id="fullName"
              defaultValue="Marina Duarte"
              className="bg-transparent border-muted text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="socialName" className="text-primary">
                Nome social
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-primary" />
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
              className="bg-transparent border-muted text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-primary">
              Nacionalidade
            </Label>
            <Input
              id="nationality"
              defaultValue="Brasileira"
              className="bg-transparent border-muted text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="race" className="text-primary">
              Raça / cor
            </Label>
            <Input
              id="race"
              defaultValue="Branca"
              className="bg-transparent border-muted text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-primary">
              Data de nascimento
            </Label>
            <Input
              id="birthDate"
              defaultValue="25/09/1992"
              className="bg-transparent border-muted text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sexo" className="text-primary">
              Sexo
            </Label>
            <Input
              id="sexo"
              defaultValue="Feminino"
              className="bg-transparent border-muted text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="celular" className="text-primary">
              Celular
            </Label>
            <Input
              id="celular"
              defaultValue="(21) 98765-4321"
              className="bg-transparent border-muted text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary">
              E-mail
            </Label>
            <Input
              id="email"
              defaultValue="marina.duarte@gmail.com"
              className="bg-transparent border-muted text-white"
            />
          </div>
        </div>
      </div>
    </>
  )
}
