# Renderização de Markdown

Componente para renderizar conteúdo markdown com estilos customizados usando `react-markdown` e suporte a GitHub Flavored Markdown (GFM).

## 📦 Dependências

```json
{
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1"
}
```

## 🚀 Uso Básico

```tsx
import { MarkdownRenderer } from '@/components/markdown-renderer'

export function MyComponent() {
  const content = `
# Título
Parágrafo com **negrito** e *itálico*.

- Item 1
- Item 2

[Link externo](https://example.com)
  `

  return <MarkdownRenderer content={content} />
}
```

## 🎨 Recursos Suportados

- **Headings**: `#`, `##`, `###`
- **Ênfase**: `**negrito**`, `*itálico*`
- **Listas**: ordenadas e não-ordenadas
- **Links**: abrem automaticamente em nova aba
- **Code**: inline e blocos
- **Blockquotes**: `>`
- **Tabelas**: via GFM
- **Task lists**: `- [ ]` e `- [x]`
- **Strikethrough**: `~~texto~~`
- **Quebras de linha**: via GFM

## 📝 Exemplos Práticos

### Em formulários
```tsx
<div className="prose">
  <MarkdownRenderer 
    content={formData.description}
    className="max-w-none"
  />
</div>
```

### Em cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Informações</CardTitle>
  </CardHeader>
  <CardContent>
    <MarkdownRenderer content={info} />
  </CardContent>
</Card>
```

### Em modais/dialogs
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Detalhes</DialogTitle>
  </DialogHeader>
  <MarkdownRenderer content={details} />
</DialogContent>
```

## 🎯 Estilos Aplicados

O componente usa classes Tailwind que respeitam o tema (light/dark):

- Parágrafos: `text-sm text-foreground-light`
- Links: `text-primary underline hover:no-underline` (abrem em nova aba)
- Listas: espaçamento vertical consistente
- Code inline: fundo `bg-muted` com fonte mono
- Headings: hierarquia visual clara
- Blockquotes: borda à esquerda

## ⚙️ Customização

### Adicionar classe customizada
```tsx
<MarkdownRenderer 
  content={content}
  className="text-base leading-relaxed"
/>
```

### Estilos globais
Os estilos base estão em `globals.css` na seção `/* Markdown Styles */`:
- Espaçamento entre elementos
- Estilos para task lists
- Divisores horizontais

## 📍 Onde está sendo usado

- **Página de Serviços**: `portal-interno-service.tsx`
  - Resumo do serviço
  - Descrição completa
  - Instruções para solicitante
  - Documentos necessários
  - Outros campos com conteúdo rico

## 💡 Dicas

1. **Performance**: É um componente client-side (`'use client'`). Use com moderação em páginas server-side.
2. **Sanitização**: O `react-markdown` já faz sanitização por padrão.
3. **Conteúdo vazio**: Sempre valide se há conteúdo antes de renderizar:
   ```tsx
   {content && <MarkdownRenderer content={content} />}
   ```
4. **Acessibilidade**: Links externos já incluem `rel="noopener noreferrer"` automaticamente.

