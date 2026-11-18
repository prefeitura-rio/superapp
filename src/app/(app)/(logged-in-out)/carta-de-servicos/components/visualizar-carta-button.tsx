import { FileTextIcon } from '@/assets/icons/file-text-icon'

/**
 * Abre a Carta de Serviços do órgão numa aba nova, no visualizador de PDF do
 * navegador (a rota responde `Content-Disposition: inline`). Quem quiser o
 * arquivo baixa por lá. Link puro: funciona sem JS e enquanto o PDF é gerado a
 * aba nova mostra o carregamento do próprio navegador.
 */
export function VisualizarCartaButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-4 text-sm leading-5 text-primary-foreground transition-colors hover:bg-primary-focused active:bg-primary-focused focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <FileTextIcon
        className="h-5 w-5 shrink-0 text-primary-foreground"
        aria-hidden
      />
      <span>Visualizar Carta de Serviços</span>
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  )
}
