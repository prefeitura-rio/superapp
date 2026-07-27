export function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .trim()
}
