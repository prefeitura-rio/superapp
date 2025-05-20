// app/services/page.tsx
import { Card } from '@/components/ui/card'
import { Briefcase, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { FloatNavigation } from '../components/float-navation'
import MainHeader from '../components/main-header'

export default function ServicesPage() {
  const services = [
    {
      title: 'Cursos',
      icon: <GraduationCap className="w-6 h-6" />,
      href: '/services/courses',
    },
    {
      title: 'Empregos',
      icon: <Briefcase className="w-6 h-6" />,
      href: '/services/jobs',
    },
  ]

  return (
    <>
      <MainHeader />
      <div className="container min-h-lvh max-w-md mx-auto pt-20 px-5 pb-6">
        <h1 className="text-2xl font-bold mb-6">Serviços</h1>

        <div className="grid grid-cols-2 gap-6">
          {services.map(service => (
            <Link key={service.title} href={service.href}>
              <Card className="p-6 h-34 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                <div>{service.icon}</div>
                <h2 className="text-lg font-semibold">{service.title}</h2>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <FloatNavigation />
    </>
  )
}
