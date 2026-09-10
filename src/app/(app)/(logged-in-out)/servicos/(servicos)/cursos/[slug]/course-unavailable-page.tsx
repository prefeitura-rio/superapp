import Link from 'next/link'

export function CourseUnavailablePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          Curso temporariamente indisponível
        </h1>
        <p className="text-muted-foreground max-w-sm">
          Este curso está passando por uma atualização e ficará disponível em
          breve. Sua inscrição não foi afetada.
        </p>
      </div>
      <Link
        href="/servicos/cursos/meus-cursos"
        className="text-sm font-medium underline underline-offset-4"
      >
        Voltar para Meus Cursos
      </Link>
    </div>
  )
}
