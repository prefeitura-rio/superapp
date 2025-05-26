'use client'

import { ServicesHeader } from '@/app/(private)/components/services-header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Edit } from 'lucide-react'
import { useState } from 'react'

export default function AlertsPage() {
  const [preferences, setPreferences] = useState({
    tecnologia: true,
    construcao: true,
    serralheria: false,
    marcenaria: false,
    costura: true,
  })

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const courseOptions = [
    {
      key: 'tecnologia' as const,
      label: 'Cursos de Tecnologia',
      status: 'Ligado',
    },
    {
      key: 'construcao' as const,
      label: 'Cursos de Construção',
      status: 'Ligado',
    },
    {
      key: 'serralheria' as const,
      label: 'Cursos de Serralheria',
      status: 'Desligado',
    },
    {
      key: 'marcenaria' as const,
      label: 'Cursos de Marcenaria',
      status: 'Desligado',
    },
    { key: 'costura' as const, label: 'Cursos de Costura', status: 'Ligado' },
  ]
  return (
    <main className="max-w-md min-h-lvh mx-auto pt-15 text-white">
      <ServicesHeader title="Alerts" />
      <div className=" text-white p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Course Preferences */}
          <div>
            {courseOptions.map((option, index) => (
              <div key={option.key}>
                <div className="flex items-center justify-between h-20 px-0">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{option.label}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-400">
                      {preferences[option.key] ? 'Ligado' : 'Desligado'}
                    </p>
                    <Switch
                      checked={preferences[option.key]}
                      onCheckedChange={() => handleToggle(option.key)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
                {index < courseOptions.length - 1 && (
                  <Separator className="bg-gray-800" />
                )}
              </div>
            ))}

            {/* Separator before WhatsApp section */}
            <Separator className="bg-gray-800" />

            {/* WhatsApp Section */}
            <div className="h-16 pt-16 flex flex-col justify-center">
              <p className="text-gray-400 text-sm mb-1">
                Os alertas serão enviados para o Whatsapp do número
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">(21) 96865-5311</span>
                <Button
                  variant="ghost"
                  className="p-2 hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
