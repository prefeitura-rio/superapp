import {
  BadgePercent,
  BookOpen,
  Briefcase,
  Calendar,
  File,
  FileText,
  GraduationCap,
  Home,
  IdCard,
  PawPrint,
  Users,
} from 'lucide-react'

export function ServiceCategories() {
  return [
    {
      name: 'IPTU',
      icon: <BadgePercent className="h-7 w-7" />,
      tag: 'desconto',
    },
    { name: 'CAD Rio', icon: <Calendar className="h-7 w-7" /> },
    { name: 'ITBI', icon: <Home className="h-7 w-7" /> },
    { name: 'Alvará', icon: <FileText className="h-7 w-7" /> },
    { name: 'Emprego', icon: <Briefcase className="h-7 w-7" /> },
    { name: 'Cursos', icon: <BookOpen className="h-7 w-7" /> },
    { name: 'Cartão Idoso', icon: <IdCard className="h-7 w-7" /> },
    { name: 'Matrícula', icon: <GraduationCap className="h-7 w-7" /> },
    { name: 'Pets', icon: <PawPrint className="h-7 w-7" /> },
    { name: 'CRAS', icon: <Users className="h-7 w-7" /> },
    { name: 'ISS', icon: <File className="h-7 w-7" /> },
  ]
}
