export const formatPhone = (ddi: string | undefined, ddd: string | undefined, valor: string | undefined) => {
  if (!valor) return '';
  return `(${ddd}) ${valor}`;
};