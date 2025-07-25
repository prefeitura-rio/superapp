'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function UserSettingsForm() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="max-w-4xl min-h-lvh mx-auto pt-24 flex flex-col space-y-6">
      <SecondaryHeader title="Configurações" />

      <RadioGroup
        value={theme}
        onValueChange={setTheme}
        className="mx-6 divide-y divide-border"
      >
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Sun className="size-6" />
            <label
              htmlFor="light"
              className="text-md font-medium cursor-pointer select-none text-foreground"
            >
              Modo Claro
            </label>
          </div>
          <RadioGroupItem value="light" id="light" />
        </div>
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Moon className="size-6" />
            <label
              htmlFor="dark"
              className="text-md font-medium cursor-pointer select-none text-foreground"
            >
              Modo Escuro
            </label>
          </div>
          <RadioGroupItem value="dark" id="dark" />
        </div>
        {/* <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Smartphone className="size-7" />
            <div className="flex flex-col">
              <label
                htmlFor="system"
                className="text-md font-medium cursor-pointer select-none"
              >
                Configurações do celular
              </label>
              <span className="text-xs text-muted-foreground pr-2">
                O aplicativo usará as mesmas configurações do seu celular.
              </span>
            </div>
          </div>
          <RadioGroupItem value="system" id="system" />
        </div> */}
      </RadioGroup>
    </div>
  )
}
