const REQUIRED_DOCUMENTS = [
  'RG ou outro documento de identidade com foto',
  'Comprovante de residência',
  'CPF',
  'Cartão da gestante (se aplicável)',
  'Caderneta de vacinação da criança (se aplicável)',
]

export function RegistrationRequirementsCard() {
  const baseTextClasses = 'text-sm tracking-normal'

  return (
    <div className="bg-card p-6 rounded-xl">
      <p
        className={`text-foreground mb-2 font-medium leading-4${baseTextClasses}`}
      >
        Procure a Clínica da Família indicada e apresente os seguintes
        documentos para efetuar o cadastro:
      </p>

      <ul
        className={`space-y-0 text-foreground-light font-normal leading-5 ${baseTextClasses}`}
      >
        {REQUIRED_DOCUMENTS.map((document, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2" aria-hidden="true">
              •
            </span>
            <span>{document}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
