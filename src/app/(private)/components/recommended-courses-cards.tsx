import googleIcon from '@/assets/google.svg'
import prefeituraVertical from '@/assets/prefeituraVertical.svg'
import senac from '@/assets/senac.svg'
import senaiIcon from '@/assets/senai.svg'
import CourseCard from './course-card'

interface Course {
  id: number
  title: string
  status: string
  date: string
  provider: string
  workload: string
  modality: string
  type: string
  recommended: boolean
  recentlyAdded: boolean
}

interface RecommendedCoursesCardsProps {
  courses: Course[]
}

const providerIcons: Record<string, string> = {
  Google: googleIcon,
  SENAI: senaiIcon,
  Prefeitura: prefeituraVertical,
  SENAC: senac,
}

function getCardColor(type: string) {
  if (type === 'technology' || type === 'ai' || type === 'education')
    return '#01A9D8'
  if (type === 'construction') return '#44CC77'
  if (type === 'environment') return '#EA5D6E'
  return '#01A9D8'
}

export default function RecommendedCoursesCards({
  courses,
}: RecommendedCoursesCardsProps) {
  const recommended = courses.filter(course => course.recommended)
  return (
    <>
      <h2 className="text-md font-medium mb-4 px-5 pt-4">Recomendados</h2>
      <div className="relative w-full overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4 px-5 w-max">
          {recommended.map(course => (
            <CourseCard
              key={course.id}
              provider={course.provider}
              title={course.title}
              workload={course.workload}
              modality={course.modality}
              color={getCardColor(course.type)}
              icon={providerIcons[course.provider] || googleIcon}
            />
          ))}
        </div>
      </div>
    </>
  )
}
