import {
  BottomSheet,
  BottomSheetFooter,
} from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'

const FILTER_OPTIONS = {
  modalidade: [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Remoto', value: 'remoto' },
    { label: 'Híbrido', value: 'hibrido' },
  ],
  certificado: [
    { label: 'Sim', value: 'sim' },
    { label: 'Não', value: 'nao' },
  ],
  categoria: [
    { label: 'Todos', value: 'todos' },
    { label: 'Saúde', value: 'saude' },
    { label: 'Nutrição', value: 'nutricao' },
    { label: 'Vigilância', value: 'vigilancia' },
    { label: 'Estética', value: 'estetica' },
    { label: 'Tecnologia', value: 'tecnologia' },
    { label: 'Legislação', value: 'legislacao' },
    { label: 'Alimentos', value: 'alimentos' },
    { label: 'Imunização', value: 'imunizacao' },
    { label: 'Radiologia', value: 'radiologia' },
  ],
  periodo: [
    { label: 'Manhã', value: 'manha' },
    { label: 'Tarde', value: 'tarde' },
    { label: 'Noite', value: 'noite' },
  ],
}

interface CoursesFilterDrawerContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFilters: Record<string, string>
  onFilterSelect: (category: string, value: string) => void
  onClearFilters: () => void
  onApplyFilters: () => void
}

export default function CoursesFilterDrawerContent({
  open,
  onOpenChange,
  selectedFilters,
  onFilterSelect,
  onClearFilters,
  onApplyFilters,
}: CoursesFilterDrawerContentProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Filtros">
      <div className="space-y-6">
        {/* Modalidade */}
        <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Modalidade
          </h3>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.modalidade.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('modalidade', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors ${
                  selectedFilters.modalidade === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option.label}
              </CustomButton>
            ))}
          </div>
        </div>

        {/* Certificado */}
        <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Certificado
          </h3>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.certificado.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('certificado', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors ${
                  selectedFilters.certificado === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
            {FILTER_OPTIONS.categoria.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('categoria', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors ${
                  selectedFilters.categoria === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option.label}
              </CustomButton>
            ))}
          </div>
        </div>

        {/* Período do dia */}
        <div>
          <h3 className="text-base font-normal text-popover-foreground mb-4">
            Período do dia
          </h3>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.periodo.map(option => (
              <CustomButton
                key={option.value}
                onClick={() => onFilterSelect('periodo', option.value)}
                className={`px-4 py-2 rounded-full text-sm font-normal transition-colors flex items-center align-middle ${
                  selectedFilters.periodo === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {option.label}
              </CustomButton>
            ))}
          </div>
        </div>
      </div>

      <BottomSheetFooter>
        <CustomButton
          variant="outline"
          onClick={onClearFilters}
          className="flex-1"
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
