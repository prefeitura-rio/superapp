# Geração de Certificados PDF

Este documento descreve como usar a funcionalidade de geração de certificados PDF implementada com a biblioteca `pdf-lib`.

## Visão Geral

A funcionalidade permite gerar certificados PDF no frontend usando um template base. Os certificados são gerados dinamicamente com os dados do aluno e curso.

## Componentes Principais

### 1. `CertificateGenerator` (lib/certificate-generator.ts)

Serviço principal para geração de certificados PDF.

```typescript
import { generateCertificate, generateAndDownload, formatDate } from '@/lib/certificate-generator'

// Gerar certificado
const pdfBytes = await generateCertificate(certificateData)

// Gerar e fazer download
await generateAndDownload(certificateData, {
  fileName: 'meu-certificado.pdf'
})
```

### 2. `MyCertificatesCard` (components/courses/certified-card.tsx)

Componente que exibe a lista de certificados do usuário.

```typescript
interface Certificate {
  id: number
  title: string
  status: string
  // ... outros campos
  // Dados necessários para geração do certificado
  studentName: string
  courseDuration: string
  issuingOrganization: string
}
```

### 3. `CoursesCertifiedDrawer` (components/drawer-contents/courses-certified-drawers.tsx)

Modal com opções para baixar, visualizar, compartilhar e imprimir certificados.

## Como Usar

### 1. Preparar os Dados

Certifique-se de que os dados do certificado incluem:

```typescript
const certificateData = {
  studentName: 'João da Silva Santos',
  courseTitle: 'Sistema Solar',
  courseDuration: '4h30 de duração',
  issuingOrganization: 'Fundação Planetário da Cidade do Rio de Janeiro - PLANETÁRIO',
  issueDate: formatDate(new Date()), // Formata automaticamente para pt-BR
}
```

### 2. Usar o Componente

```tsx
import { MyCertificatesCard } from '@/app/components/courses/certified-card'

function MyCertificatesPage() {
  const certificates = [
    {
      id: 1,
      title: 'Sistema Solar',
      status: 'certificate_available',
      studentName: 'João da Silva Santos',
      courseDuration: '4h30 de duração',
      issuingOrganization: 'Fundação Planetário da Cidade do Rio de Janeiro - PLANETÁRIO',
      // ... outros campos necessários
    }
  ]

  return <MyCertificatesCard certificates={certificates} />
}
```

### 3. Geração Direta

```typescript
import { generateAndDownload } from '@/lib/certificate-generator'

async function handleDownload() {
  try {
    await generateAndDownload(certificateData, {
      fileName: 'meu-certificado.pdf'
    })
  } catch (error) {
    console.error('Erro ao gerar certificado:', error)
  }
}
```

## Template PDF

O template base está localizado em `/public/templates/certificate-template.pdf`. Este arquivo contém:

- Moldura decorativa
- Texto "CERTIFICADO de conclusão de curso"
- Espaços para preenchimento dinâmico

## Personalização

### Posicionamento do Texto

Para ajustar o posicionamento dos textos no certificado, edite a função `addTextToCertificate` em `lib/certificate-generator.ts`:

```typescript
// Exemplo de ajuste de posição
page.drawText(data.studentName, {
  x: centerX - getTextWidth(data.studentName, boldFont, 24) / 2,
  y: height - 280, // Ajuste a posição Y aqui
  size: 24,
  font: boldFont,
  color: black,
})
```

### Cores

As cores são definidas na função `addTextToCertificate`:

```typescript
const darkBlue = rgb(0.102, 0.294, 0.478) // #1A4B7A
const darkGray = rgb(0.290, 0.290, 0.290) // #4A4A4A
const black = rgb(0, 0, 0)
```

### Fontes

As fontes utilizadas são:

- `StandardFonts.Helvetica` - Texto normal
- `StandardFonts.HelveticaBold` - Nome do aluno

## Funcionalidades

### 1. Download
Gera o PDF e inicia o download automaticamente.

### 2. Visualização
Gera o PDF e abre em nova aba para visualização.

### 3. Compartilhamento
Gera o PDF e usa a API de compartilhamento do navegador (quando disponível).

### 4. Impressão
Gera o PDF e abre a janela de impressão.

## Estados de Carregamento

O componente mostra "Gerando..." durante a geração do PDF e desabilita os botões para evitar múltiplas requisições.

## Tratamento de Erros

Todos os métodos incluem tratamento de erro com logs no console. Para produção, considere implementar notificações de erro para o usuário.

## Dependências

- `pdf-lib`: Biblioteca para manipulação de PDFs
- `next/image`: Otimização de imagens
- `react`: Hooks e componentes

## Limitações

1. O template PDF deve estar acessível via URL pública
2. A geração é feita no frontend, limitada pela capacidade do navegador
3. Nomes muito longos podem quebrar o layout (considere truncar)
4. A funcionalidade de compartilhamento depende do suporte do navegador
