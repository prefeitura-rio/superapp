# Feature de Geração de Certificados

## Visão Geral

Esta feature fornece geração automatizada de certificados para conclusões de cursos. O sistema suporta dois modos:

1. **URL Direta de Certificado**: Quando um curso fornece uma `certificateUrl`, o sistema a usa diretamente
2. **Geração Dinâmica**: Quando nenhuma URL é fornecida, o sistema gera dinamicamente um certificado baseado no template da organização

## Arquitetura

### Componentes

#### 1. Mapeamento de Templates (`src/lib/certificate-template-mapping.ts`)

Mapeia nomes de organizações para seus templates PDF correspondentes.

**Templates Disponíveis:**
- `juvrio.pdf` - Secretaria Especial da Juventude Carioca - JUV-RIO
- `planetario.pdf` - Fundação Planetário da Cidade do Rio de Janeiro - PLANETÁRIO
- `smac.pdf` - Secretaria Municipal do Ambiente e Clima - SMAC
- `smpd.pdf` - Secretaria Municipal da Pessoa com Deficiência - SMPD

**Funções Principais:**
- `getCertificateTemplate(organization)` - Retorna o nome do template baseado na organização ou `null` se não encontrado
- `getTemplateUrl(organization)` - Retorna o caminho completo da URL do template ou `null` se não encontrado

**Uso:**
```typescript
import { getTemplateUrl, getCertificateTemplate } from '@/lib/certificate-template-mapping'

const template = getCertificateTemplate('SMAC') // Retorna 'smac' ou null
const url = getTemplateUrl('SMAC') // Retorna '/templates/smac.pdf' ou null
```

**Comportamento de Erro:**
- Se a organização não estiver mapeada, retorna `null` em vez de usar template padrão
- Isso força o sistema a exibir erro quando não há template disponível

#### 2. Gerador de Certificados (`src/lib/certificate-generator.ts`)

Gera certificados PDF utilizando a biblioteca `pdf-lib`.

**Funções Principais:**
- `generateCertificate(data, options)` - Gera bytes do PDF
- `generateAndDownload(data, options)` - Gera e inicia o download
- `formatDate(date)` - Formata data no padrão brasileiro
- `formatDuration(hours)` - Formata duração do curso

**Interface CertificateData:**
```typescript
interface CertificateData {
  studentName: string
  courseTitle: string
  courseDuration: string
  issuingOrganization: string
  issueDate: string
  organization?: string // Usado para selecionar o template correto
}
```

**Como Funciona:**
1. Carrega o template PDF apropriado baseado em `organization`
2. **Se template não encontrado**: Lança erro em vez de usar padrão
3. Adiciona o nome do estudante (36px, negrito)
4. Adiciona texto do curso com título destacado
5. Adiciona data e localização
6. Retorna bytes do PDF

**Tratamento de Erro:**
- Se `organization` não estiver mapeada, lança erro "Template não encontrado para organização: X"
- Não há mais fallback para template padrão

#### 3. Componente de Certificados (`src/app/components/courses/certified-card.tsx`)

Exibe uma lista de certificados disponíveis para o usuário.

**Interface Certificate:**
```typescript
interface Certificate {
  id: number
  title: string
  description?: string
  imageUrl?: string
  provider?: string
  status: string
  enrollmentId: string
  certificateUrl?: string // URL direta se disponível
  enrolledAt: string
  updatedAt: string
  modalidade?: string
  workload?: string
  institutionalLogo?: string
  hasCertificate: boolean
  studentName: string
  courseDuration: string
  issuingOrganization: string
}
```

**Status dos Certificados:**
- `certificate_available` - Certificado está pronto (URL ou pode ser gerado)
- `certificate_pending` - Certificado ainda não está disponível

**Comportamento:**
- Cursos com status `'concluded'` → `certificate_available`
- Cursos com status `'approved'` → `certificate_pending`

#### 4. Drawer de Certificados (`src/app/components/drawer-contents/courses-certified-drawers.tsx`)

Fornece ações para certificados (baixar, visualizar, compartilhar, imprimir).

**Comportamento:**
- Se `certificateUrl` for fornecido → Usa URL direta para todas as ações
- Se `certificateUrl` não for fornecido → Gera certificado dinamicamente usando o template apropriado

**Ações Disponíveis:**

1. **Baixar** - Baixa o certificado como PDF
   - Com URL: Download direto da URL
   - Sem URL: Geração dinâmica + download

2. **Compartilhar** - Compartilha via API nativa (mobile) ou URL (desktop)
   - **Com URL**: Compartilha a URL diretamente
     - Mobile: `navigator.share()` com URL
     - Desktop: Copia URL para clipboard + toast de sucesso
   - **Sem URL**: Gera PDF e compartilha arquivo
     - Mobile: `navigator.share()` com arquivo PDF
     - Desktop: Fallback para download

3. **Visualizar** - Abre certificado em nova aba
   - Com URL: Abre URL diretamente
   - Sem URL: Gera PDF e abre blob em nova aba

4. **Imprimir** - Abre diálogo de impressão para o certificado
   - Com URL: Abre URL em nova aba + `window.print()`
   - Sem URL: Gera PDF e abre blob para impressão

**Tratamento de Erro:**
- Usa `react-hot-toast` para exibir mensagens de erro
- Toast: "Erro ao gerar certificado" quando template não encontrado
- Fallbacks silenciosos para evitar múltiplos toasts

## Diagrama de Fluxo

```
Usuário abre página de Certificados
         ↓
Buscar inscrições de usuário com status 'concluded' ou 'approved'
         ↓
Para cada inscrição:
    ├─ Status 'concluded' → certificate_available
    ├─ Status 'approved' → certificate_pending
    └─ Inclui dados do certificado (nome, duração, organização)
         ↓
Usuário clica no certificado
         ↓
Verifica se certificateUrl existe
         ↓
    ├─ SIM → Usa certificateUrl para todas as ações
    │   ├─ Baixar: Download direto
    │   ├─ Compartilhar: Compartilha URL
    │   ├─ Visualizar: Abre URL
    │   └─ Imprimir: Abre URL + print()
    └─ NÃO → Gera certificado dinamicamente
            ├─ Verifica se provider está mapeado
            ├─ SIM → Carrega template + gera PDF
            └─ NÃO → Exibe toast "Erro ao gerar certificado"
```

## Pontos de Integração

### Componente de Página (`src/app/(app)/(logged-in-out)/servicos/(servicos)/cursos/certificados/page.tsx`)

Busca inscrições do usuário e prepara dados do certificado:

```typescript
const certificatesWithEnrollments = enrollments
  .filter(enrollment => 
    (enrollment.status === 'concluded' || enrollment.status === 'approved') && 
    enrollment.curso.has_certificate === true
  )
  .map(enrollment => ({
    ...enrollment.curso,
    provider: enrollment.curso?.organization,
    // Só permite geração de certificado se status for 'concluded'
    status: enrollment.status === 'concluded' 
      ? 'certificate_available' 
      : 'certificate_pending',
    certificateUrl: enrollment.certificate_url,
    // ... outros campos
  }))
```

### Lógica de Status de Curso (`src/lib/course-utils.ts`)

Define comportamento dos botões na tela de cursos:

```typescript
// Usuário concluído com certificado
if (userEnrollment?.status === 'concluded') {
  if (userEnrollment.certificate_url) {
    return { status: 'certificate_available', buttonText: 'Acessar certificado' }
  }
  if (course.has_certificate && !userEnrollment.certificate_url) {
    return { status: 'certificate_pending', buttonText: 'Aguardando certificado' }
  }
}

// Usuário aprovado com certificado (mostra como pendente)
if (userEnrollment?.status === 'approved' && course.has_certificate) {
  return { status: 'certificate_pending', buttonText: 'Aguardando certificado' }
}
```

## Adicionando um Novo Template

1. **Adicione o template PDF** em `public/templates/`:
   ```bash
   # Exemplo: Adicionar template para Secretaria de Educação
   cp escola-template.pdf public/templates/sme.pdf
   ```

2. **Atualize o mapeamento** em `src/lib/certificate-template-mapping.ts`:
   ```typescript
   const TEMPLATE_MAPPINGS: OrganizationTemplateMapping[] = [
     // ... mapeamentos existentes
     {
       organization: 'Secretaria Municipal de Educação',
       template: 'sme',
     },
   ]
   ```

3. **Atualize o tipo CertificateTemplate**:
   ```typescript
   export type CertificateTemplate = 'juvrio' | 'planetario' | 'smac' | 'smpd' | 'sme'
   ```

**⚠️ Importante:** 
- O nome da organização deve corresponder **exatamente** ao campo `organization` do curso
- A comparação é case-insensitive
- Se não encontrar mapeamento, o sistema exibirá erro em vez de usar template padrão

## Layout do Conteúdo do Certificado

O sistema adiciona dinamicamente as seguintes informações ao template PDF:

1. **Texto do Cabeçalho** (12px, cinza):
   ```
   "A Prefeitura da Cidade do Rio de Janeiro certifica que"
   ```

2. **Nome do Estudante** (36px, negrito, preto):
   ```
   [Nome do Estudante]
   ```
   - Suporte multi-linha
   - Quebra automática para nomes longos

3. **Informações do Curso** (12px, com título destacado):
   ```
   participou do curso "[Título do Curso]", com [Duração] de duração,
   sob a coordenação da [Organização Emitente]
   ```
   - Título do curso é destacado em preto
   - Restante do texto é cinza

4. **Data e Local** (12px, cinza):
   ```
   Rio de Janeiro, [Data Atual]
   ```

## Tratamento de Erros

- **Template Não Encontrado**: Exibe toast "Erro ao gerar certificado" (não usa template padrão)
- **Erro na Geração**: Registra erro e exibe toast com `react-hot-toast`
- **certificateUrl Inválida**: Usa geração dinâmica como fallback
- **Falha no Carregamento do Template**: Lança erro com mensagem útil
- **Múltiplos Toasts**: Sistema evita duplicação com fallbacks silenciosos

## Considerações de Performance

- Geração de PDF é feita client-side usando `pdf-lib`
- Templates são cacheados pelo navegador após primeira busca
- Arquivos grandes podem impactar dispositivos móveis - considere compressão
- Use `certificateUrl` quando disponível para evitar sobrecarga de geração
- Compartilhamento de URL é mais eficiente que geração + compartilhamento de arquivo

## Testes

### Casos de Teste

1. **Certificado com URL**: Verificar download/visualização/compartilhamento/impressão diretos
2. **Certificado sem URL**: Verificar se geração dinâmica funciona
3. **Diferentes Organizações**: Verificar se template correto é carregado
4. **Organização Não Mapeada**: Verificar se exibe toast de erro
5. **Status 'approved'**: Verificar se mostra como pendente
6. **Status 'concluded'**: Verificar se permite geração
7. **Nomes Longos**: Verificar se quebra de texto funciona corretamente
8. **Títulos Longos de Cursos**: Verificar se quebra de texto do curso funciona
9. **Compartilhamento Mobile**: Verificar API nativa de compartilhamento
10. **Compartilhamento Desktop**: Verificar cópia para clipboard
11. **Cenários de Erro**: Verificar comportamento de fallback

### Teste Manual

```bash
# 1. Navegue até a página de certificados
http://localhost:3000/servicos/cursos/certificados

# 2. Clique em um certificado
# 3. Tente todas as ações: Baixar, Compartilhar, Visualizar, Imprimir
# 4. Verifique se o conteúdo do certificado está correto
```

## Melhorias Futuras

- [ ] Adicionar verificação/validação de certificado
- [ ] Suporte para assinaturas digitais
- [ ] Geração de certificados em lote
- [ ] Funcionalidade de envio de certificado por email
- [ ] Marca d'água em certificados
- [ ] Suporte para certificados multi-idioma
- [ ] Funcionalidade de pré-visualização de template
- [ ] Sistema de notificações quando certificado fica disponível
- [ ] Histórico de downloads/compartilhamentos
- [ ] Suporte para templates personalizados por usuário

## Resolução de Problemas

### Certificado não está gerando
1. Verifique o console do navegador para erros
2. Verifique se arquivo de template existe em `public/templates/`
3. Verifique aba de rede para falhas na busca do template
4. Verifique se nome da organização corresponde ao mapeamento
5. **Novo**: Verifique se organização está mapeada (não há mais template padrão)

### Toast "Erro ao gerar certificado" aparece
1. Verifique se organização está no mapeamento de templates
2. Verifique se nome da organização nos dados corresponde exatamente ao mapeamento
3. Verifique console para avisos de mapeamento
4. Adicione novo mapeamento se necessário

### Template errado sendo usado
1. Verifique nome da organização nos dados de inscrição
2. Verifique mapeamento em `certificate-template-mapping.ts`
3. Verifique sensibilidade a maiúsculas/minúsculas (comparação é case-insensitive)
4. Verifique console para avisos de mapeamento

### Problemas de posicionamento de texto no certificado
1. Verifique se dimensões do template correspondem às expectativas
2. Verifique se estrutura do PDF do template mudou
3. Ajuste constantes de posicionamento na função `addTextToCertificate()`

### Compartilhamento não funciona
1. **Mobile**: Verifique se `navigator.share` está disponível
2. **Desktop**: Verifique se `navigator.clipboard` está disponível
3. **Com URL**: Verifique se URL é válida e acessível
4. **Sem URL**: Verifique se organização está mapeada

### Múltiplos toasts aparecem
1. Verifique se não há chamadas duplicadas de `toast.error()`
2. Verifique se fallbacks estão usando funções internas silenciosas
3. Verifique console para logs de erro duplicados

## Dependências

- `pdf-lib` - Geração e manipulação de PDF
- `next` - Framework React
- `react-hot-toast` - Sistema de notificações toast
- React hooks para gerenciamento de estado

## Arquivos Modificados/Criados

### Arquivos Criados:
- `src/lib/certificate-template-mapping.ts` - Lógica de mapeamento de templates
- `docs/pt-br/CERTIFICATE_GENERATION_FEATURE.md` - Esta documentação

### Arquivos Modificados:
- `src/lib/certificate-generator.ts` - Atualizado para suportar templates dinâmicos e tratamento de erro rigoroso
- `src/types/certificate.ts` - Adicionado campo `organization`
- `src/app/components/courses/certified-card.tsx` - Passa provider para drawer
- `src/app/components/drawer-contents/courses-certified-drawers.tsx` - Lida com URL e geração, implementa toast de erro
- `src/app/(app)/(logged-in-out)/servicos/(servicos)/cursos/certificados/page.tsx` - Filtra por status 'concluded' e 'approved'
- `src/lib/course-utils.ts` - Lógica de status de curso atualizada
- `src/app/layout.tsx` - Configuração do Toaster (já existente)

## Histórico de Versões

- **v3.0** - Implementação completa com tratamento rigoroso de erros e toast notifications
  - ✅ Suporte para status 'approved' e 'concluded'
  - ✅ Tratamento rigoroso de templates (sem fallback padrão)
  - ✅ Toast notifications com `react-hot-toast`
  - ✅ Compartilhamento otimizado (URL vs arquivo)
  - ✅ Prevenção de múltiplos toasts
  - ✅ Fallbacks silenciosos
- **v2.0** - Adicionado suporte multi-template e manipulação de certificateUrl
- **v1.0** - Geração inicial de certificado com template único

