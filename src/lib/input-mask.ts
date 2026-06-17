export function applyMask(
  raw: string,
  formatType: string | null | undefined
): string {
  const digits = raw.replace(/\D/g, '')
  switch (formatType) {
    case 'cpf':
      return digits
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    case 'phone':
      if (digits.length <= 10)
        return digits
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
      return digits
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    case 'cep':
      return digits.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
    case 'date':
      return digits
        .slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
    case 'number':
      return digits
    default:
      return raw
  }
}
