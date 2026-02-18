# Perguntas Adicionais - Inscrição em Vagas

## Visão Geral

Esta página renderiza dinamicamente perguntas adicionais específicas de cada vaga de emprego, baseadas nas informações complementares retornadas pela API.

## Estrutura de Arquivos

- `page.tsx` - Página principal que busca os dados da API (server component)
- `perguntas-adicionais-content.tsx` - Componente client-side com a lógica do formulário
- `unica-selecao-drawer-content.tsx` - Bottom sheet para seleção única
- `multipla-selecao-drawer-content.tsx` - Bottom sheet para seleção múltipla

## Tipos de Campos Suportados

### 1. `resposta_curta`
- Renderiza um `CustomInput` de texto livre
- Validação: obrigatório (se configurado)

### 2. `resposta_numerica`
- Renderiza um `CustomInput` com `type="number"`
- Validação: 
  - Obrigatório (se configurado)
  - Valor mínimo (se configurado)
  - Valor máximo (se configurado)

### 3. `selecao_unica`
- Renderiza um `ActionDiv` que abre um bottom sheet
- Bottom sheet contém um `RadioList` com as opções
- Validação: obrigatório (se configurado)
- Comportamento: fecha automaticamente após seleção

### 4. `selecao_multipla`
- Renderiza um `ActionDiv` que abre um bottom sheet
- Bottom sheet contém um `CheckboxList` com as opções
- Validação: mínimo 1 opção (se obrigatório)
- Comportamento: usuário pode selecionar múltiplas opções e fechar manualmente

## Estrutura de Dados da API

```typescript
interface InformacaoComplementar {
  id: string
  id_vaga: string
  titulo: string
  obrigatorio: boolean
  tipo_campo: 'resposta_curta' | 'resposta_numerica' | 'selecao_unica' | 'selecao_multipla'
  valor_minimo: number | null
  valor_maximo: number | null
  opcoes: string[] | null
  created_at: string
  updated_at: string
}
```

## Validação

A validação é gerada dinamicamente usando Zod baseada nas configurações de cada campo:

- Campos obrigatórios geram erro se não preenchidos
- Campos numéricos respeitam min/max se configurados
- Seleção múltipla requer pelo menos 1 opção se obrigatório

## Submissão

Ao clicar em "Finalizar inscrição", os dados são formatados no seguinte formato:

```typescript
{
  respostas: [
    {
      id_informacao_complementar: string,
      resposta: string | number | string[]
    }
  ]
}
```

## Drawer de Sucesso

Após o envio bem-sucedido da candidatura:

1. Confetti é disparado na tela
2. Um drawer modal é exibido (não pode ser fechado arrastando)
3. Conteúdo do drawer:
   - `SecondaryHeader` com título vazio
   - Título "Candidatura enviada"
   - Mensagem explicativa sobre análise da candidatura
   - `ThemeAwareVideo` com animação de sucesso
   - Botão "Voltar para a tela inicial" que redireciona para `/servicos/empregos`

### Características do Drawer

- **Modal**: `modal={true}` - impede interação com o fundo
- **Não dismissível**: `dismissible={false}` - usuário não pode arrastar para fechar
- **Tela cheia**: Ocupa a tela inteira para experiência imersiva
- **Vídeo temático**: Adapta-se ao tema claro/escuro automaticamente

## TODO

- [ ] Implementar chamada real para API de informações complementares
- [ ] Implementar chamada real para enviar respostas
- [ ] Adicionar loading state durante busca inicial
- [ ] Adicionar tratamento de erro quando API falhar
- [ ] Configurar vídeos reais no CDN (atualmente usando placeholders)
