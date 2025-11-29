import { COURSE_FILTERS } from '@/actions/courses/utils'
import {
  BottomSheet,
  BottomSheetFooter,
} from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import type { CategoryFilter } from '@/lib/course-category-helpers'

interface CoursesFilterDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFilters: Record<string, string>
  onFilterSelect: (category: string, value: string) => void
  onClearFilters: () => void
  onApplyFilters: () => void
  categoryFilters?: CategoryFilter[]
}

export default function CoursesFilterDrawerContent({
  open,
  onOpenChange,
  selectedFilters,
  onFilterSelect,
  onClearFilters,
  onApplyFilters,
  categoryFilters = [],
}: CoursesFilterDrawerContentProps) {
  // Helper to check if a value is selected
  const isSelected = (category: string, value: string) => {
    return selectedFilters[category] === value
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtros"
      contentClassName="max-h-[80vh]! md:max-h-[90vh] flex flex-col"
      className="flex-1 min-h-0"
    >
      <div className="space-y-6 pb-10">
        {/* Modalidade */}
        <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Modalidade
          </h3>
          <div className="flex flex-wrap gap-2">
            {COURSE_FILTERS.modalidade.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('modalidade', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors focus:opacity-100 active:opacity-100 border-[1px] border-muted-foreground ${
                  isSelected('modalidade', option.value)
                    ? 'bg-primary text-background hover:bg-primary'
                    : 'bg-background text-foreground hover:bg-background'
                }`}
              >
                {option.label}
              </CustomButton>
            ))}
          </div>
        </div>

        {/* Local do curso */}
        <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Local do curso
          </h3>
          <div className="flex flex-wrap gap-2">
            {COURSE_FILTERS.local_curso.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('local_curso', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors focus:opacity-100 active:opacity-100 border-[1px] border-muted-foreground ${
                  isSelected('local_curso', option.value)
                    ? 'bg-primary text-background hover:bg-primary'
                    : 'bg-background text-foreground hover:bg-background'
                }`}
              >
                {option.label}
              </CustomButton>
            ))}
          </div>
        </div>

        {/* Categoria */}
        <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Categoria
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.length > 0
              ? categoryFilters.map(category => (
                  <CustomButton
                    key={category.value}
                    onClick={() => onFilterSelect('categoria', category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-normal transition-colors focus:opacity-100 active:opacity-100 border-[1px] border-muted-foreground ${
                      isSelected('categoria', category.value)
                        ? 'bg-primary text-background hover:bg-primary'
                        : 'bg-background text-foreground hover:bg-background'
                    }`}
                  >
                    {category.label}
                  </CustomButton>
                ))
              : COURSE_FILTERS.categoria.map(option => (
                  <CustomButton
                    key={option.value}
                    onClick={() => onFilterSelect('categoria', option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-normal transition-colors focus:opacity-100 active:opacity-100 border-[1px] border-muted-foreground ${
                      isSelected('categoria', option.value)
                        ? 'bg-primary text-background hover:bg-primary'
                        : 'bg-background text-foreground hover:bg-background'
                    }`}
                  >
                    {option.label}
                  </CustomButton>
                ))}
          </div>
        </div>

        {/* Acessibilidade */}
        {/* <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Acessibilidade
          </h3>
          <div className="flex flex-wrap gap-2">
            {COURSE_FILTERS.acessibilidade.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('acessibilidade', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors ${
                  isSelected('acessibilidade', option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option.label}
              </CustomButton>
            ))}
          </div>
        </div> */}
      </div>

      <BottomSheetFooter>
        <CustomButton
          variant="outline"
          onClick={onClearFilters}
          className="flex-1 focus:outline-none! focus:ring-0! focus:ring-offset-0!"
        >
          Limpar filtros
        </CustomButton>
        <CustomButton onClick={onApplyFilters} className="flex-1">
          Filtrar
        </CustomButton>
      </BottomSheetFooter>
    </BottomSheet>
  )
}
