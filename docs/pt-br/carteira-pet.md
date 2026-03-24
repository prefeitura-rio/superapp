# Carteira Pet

## Sumário

- [Visão Geral](#visão-geral)
- [Rotas](#rotas)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Fluxo de Dados](#fluxo-de-dados)
- [Componentes](#componentes)
- [Integração com a API](#integração-com-a-api)
- [Navegação e Tabs](#navegação-e-tabs)
- [Ícones e Assets](#ícones-e-assets)

---

## Visão Geral

A **Carteira Pet** permite ao cidadão visualizar os animais registrados em seu CPF no sistema da Prefeitura do Rio de Janeiro. A funcionalidade está integrada à Carteira Digital (`/carteira`) por meio de um sistema de abas, e oferece:

- Lista de pets do cidadão com cartão visual (frente e verso com flip animado)
- Página de detalhe do pet com ações rápidas de serviços municipais
- Indicação de microchipagem pendente
- Informações do tutor responsável
- Estado de loading com skeleton e tratamento de erro (pet não encontrado)

---

## Rotas

| URL | Tipo | Descrição |
|-----|------|-----------|
| `/carteira` | Server Component | Carteira principal — exibe a aba "Meus Pets" quando o cidadão possui pets cadastrados |
| `/carteira?pets=true` | Server Component | Carteira no modo pets (ativa a aba "Meus Pets") |
| `/carteira/pet` | Server Component | Redireciona para `/carteira?pets=true` |
| `/carteira/pet/[id]` | Server Component | Detalhe de um pet específico pelo `id_animal` |

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── (app)/
│   │   └── (logged-in)/
│   │       └── carteira/
│   │           ├── (carteira)/
│   │           │   └── page.tsx                    # Página principal da carteira (modificada)
│   │           └── pet/
│   │               ├── page.tsx                    # Redirect → /carteira?pets=true
│   │               ├── components/
│   │               │   ├── tutor-info.tsx           # Bloco de informações do tutor
│   │               │   └── microchipping-status-card.tsx  # Card de alerta de microchipagem
│   │               └── [slug]/
│   │                   ├── page.tsx                # Server Component: busca pet + tutor
│   │                   ├── pet-client-page.tsx     # Client Component: UI do detalhe
│   │                   ├── pet-not-found.tsx       # Tela de erro
│   │                   └── loading.tsx             # Skeleton de carregamento
│   └── components/
│       ├── pet-card-base.tsx                       # Base visual do cartão (fundo, blobs, patinhas)
│       ├── slider-tabs.tsx                         # Componente de abas com slider animado
│       ├── wallet-tabs.tsx                         # Abas "Meus Cartões" / "Meus Pets"
│       ├── wallet-content.tsx                      # Conteúdo da carteira (tabbed view)
│       └── wallet-cards/
│           └── pet-wallet.tsx                      # Componente PetCard (flip + link)
├── components/
│   └── ui/
│       └── custom/
│           ├── pet-card-front-content.tsx          # Frente do cartão (nome, espécie, foto, microchip)
│           └── pet-card-back-content.tsx           # Verso do cartão (nascimento, raça, castrado)
└── assets/
    └── icons/
        ├── pet-card-blob.tsx                       # Blobs decorativos do cartão
        ├── dog-paw-icon.tsx                        # Ícone de patinha (padrão de fundo)
        ├── dog-paw2-icon.tsx                       # Ícone de patinha (botão atendimento)
        ├── chip-icon.tsx                           # Ícone de microchip
        ├── scissors-icon.tsx                       # Ícone de castração
        └── vaccine-icon.tsx                        # Ícone de vacinação
```

---

## Fluxo de Dados

### Página da Carteira (`/carteira`)

```
Wallet() [Server Component]
  │
  ├── getUserInfoFromToken()           → extrai CPF/nome do JWT
  ├── getCitizenCpfPets(cpf)          → lista de pets do cidadão
  ├── getDalCitizenCpfWallet(cpf)     → dados da carteira digital
  ├── getDalHealthUnitInfo(cnes)      → unidade de saúde
  ├── getDalHealthUnitRisk(cnes)      → risco da unidade
  └── getDalCitizenCpfMaintenanceRequest(cpf) → solicitações de manutenção
        │
        └── <WalletContent /> [Client Component, em Suspense]
              │
              ├── useSearchParams() → detecta ?pets=true
              ├── WalletTabs        → aba ativa (cards | pets)
              ├── [pets view]  → lista de PetCard com link para /carteira/pet/{id}
              └── [cards view] → WalletCardsWrapper (carteira normal)
```

### Detalhe do Pet (`/carteira/pet/[slug]`)

```
PetPage() [Server Component]
  │
  ├── getUserInfoFromToken()               → extrai CPF do JWT
  ├── getDalCitizenCpf(cpf)               → dados completos do cidadão (email, telefone)
  └── getCitizenCpfPetsPetId(cpf, id)     → dados do pet específico
        │
        ├── [erro/não encontrado] → <PetNotFound />
        └── [sucesso]            → <PetClientPage />
              │
              ├── PetCard (flip animado, frente + verso)
              ├── Botões de ação rápida (links externos Prefeitura RJ)
              ├── MicroshippingStatusCard (se microchip pendente)
              └── TutorInfo (nome, CPF, telefone, e-mail)
```

---

## Componentes

### `PetCard` (`wallet-cards/pet-wallet.tsx`)

Componente principal de exibição do pet. Suporta modo lista (sem flip, como link) e modo detalhe (com flip).

```tsx
<PetCard
  petData={pet}           // ModelsPet
  enableFlip={false}      // desativa flip na lista
  asLink                  // renderiza como <Link>
  showInitialShine        // animação de brilho ao montar
  href={`/carteira/pet/${pet.id_animal}`}
/>
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `petData` | `ModelsPet` | — | Dados do pet vindos da API |
| `enableFlip` | `boolean` | `true` | Habilita o flip de frente/verso ao tocar |
| `asLink` | `boolean` | `false` | Envolve o cartão em `<Link>` |
| `href` | `string` | — | Destino do link (necessário com `asLink`) |
| `showInitialShine` | `boolean` | `false` | Dispara animação de brilho ao montar |
| `onClick` | `() => void` | — | Callback de clique (passado ao `<Link>`) |

---

### `PetCardBase` (`app/components/pet-card-base.tsx`)

Estrutura visual base do cartão com background laranja claro (`#FFF0DF`), padrão de patinhas gerado programaticamente e blobs SVG decorativos nos cantos.

---

### `WalletContent` (`app/components/wallet-content.tsx`)

Client Component que lê `?pets=true` via `useSearchParams` e alterna entre a lista de pets e os cartões da carteira. Deve ser envolvido em `<Suspense>` no Server Component pai.

```tsx
// Em page.tsx (Server Component)
<Suspense>
  <WalletContent
    hasPets={pets.length > 0}
    pets={pets}
    walletData={walletData}
    maintenanceRequests={maintenanceRequests}
    healthUnitData={healthUnitData}
    healthUnitRiskData={healthUnitRiskData}
  />
</Suspense>
```

---

### `WalletTabs` (`app/components/wallet-tabs.tsx`)

Renderiza as abas "Meus Cartões" e "Meus Pets" usando `SliderTabs`. Só é exibido quando `hasPets === true`. A navegação é feita via URL (`/carteira` vs `/carteira?pets=true`), sem estado local.

---

### `TutorInfo` (`carteira/pet/components/tutor-info.tsx`)

Exibe os dados do tutor do pet: nome, CPF, telefone e e-mail. Recebe os dados como props após o Server Component resolver as chamadas de API.

---

### `MicroshippingStatusCard` (`carteira/pet/components/microchipping-status-card.tsx`)

Card de alerta exibido quando o pet não possui microchip registrado. Exibido abaixo do `PetCard` na página de detalhe.

---

## Integração com a API

Todos os endpoints são chamados via `customFetch` (em `custom-fetch.ts` na raiz) que injeta o `Authorization: Bearer` automaticamente a partir do cookie `access_token`.

### Endpoints utilizados

| Função | Método | Endpoint |
|--------|--------|----------|
| `getCitizenCpfPets(cpf)` | `GET` | `/citizen/{cpf}/pets` |
| `getCitizenCpfPetsPetId(cpf, petId)` | `GET` | `/citizen/{cpf}/pets/{petId}` |
| `getDalCitizenCpf(cpf)` | `GET` | `/citizen/{cpf}` (via DAL com cache) |

### Tipos relevantes

```ts
// src/http/models/modelsPet.ts
interface ModelsPet {
  id_animal: number
  animal_nome: string
  especie_nome: string
  sexo_sigla: string         // 'M' | 'F'
  raca_nome: string
  microchip_numero: number | null
  indicador_castrado: boolean
  nascimento_data: string    // ISO date
  registro_data: string      // ISO date
  foto_url: string
  clinica_credenciada: { nome: string } | null
}
```

---

## Navegação e Tabs

A alternância entre cartões e pets é **totalmente baseada em URL** (sem estado React), o que garante:

- Compartilhamento de link da aba ativa
- Funcionamento correto do botão voltar do navegador
- Compatibilidade com Server Components (sem hidratação desnecessária)

```
/carteira          → aba "Meus Cartões" ativa
/carteira?pets=true → aba "Meus Pets" ativa
```

O `SliderTabs` usa posicionamento CSS calculado por índice para animar o slider sem JavaScript extra:

```css
left: calc({activeIndex} * (100% / {totalTabs}) + 4px)
```

---

## Ícones e Assets

Todos os ícones são componentes SVG com `IconProps` (`SVGProps<SVGSVGElement>`), aceitando `className`, `fill` e qualquer atributo nativo de SVG.

| Arquivo | Uso |
|---------|-----|
| `pet-card-blob.tsx` | Decoração dos cantos do cartão (4 variações: TopLeft, BottomLeft, TopMiddle, BottomMiddle) |
| `dog-paw-icon.tsx` | Padrão de fundo repetido do cartão (400 instâncias geradas com `opacity-10`) |
| `dog-paw2-icon.tsx` | Botão de ação rápida "Atendimento clínico" |
| `chip-icon.tsx` | Botão de ação rápida "Microchip" |
| `scissors-icon.tsx` | Botão de ação rápida "Castração" |
| `vaccine-icon.tsx` | Botão de ação rápida "Vacinação" |
