# 05 — Code style e convenções

Stack alvo: TypeScript, Next.js **16** App Router, React 19, shadcn/ui, Radix, Tailwind 4.

## Estrutura e estilo

- Código TypeScript conciso e funcional; evitar classes.
- Preferir iteração e modularização a duplicação.
- Nomes descritivos com verbos auxiliares (`isLoading`, `hasError`).
- Ordem típica de arquivo: export do componente → subcomponentes → helpers → conteúdo estático → tipos.
- Diretórios: `lowercase-with-dashes` (ex.: `components/auth-wizard`).
- Preferir **named exports** para componentes.

## TypeScript

- Preferir `interface` a `type` para props/objetos.
- Evitar `enum`; usar maps/const objects.
- Zod para validação e inferência de tipos.
- Componentes funcionais com interface de props.

## Sintaxe

- Funções puras com keyword `function`.
- Condicionais simples sem chaves desnecessárias.
- JSX declarativo.

## UI — shadcn, Tailwind, ícones e tokens

- **shadcn/ui primeiro:** reutilizar componentes em `src/components/ui/` (`components.json` → estilo new-york) antes de criar UI do zero. Compor com Radix + Tailwind; mobile-first.
- UI de domínio em `src/app/components/`.

### Tailwind (obrigatório)

- Estilizar **sempre** com classes Tailwind (`className`). **Não** usar CSS inline (`style={{ ... }}`) salvo quando for realmente necessário (ex.: valor dinâmico que o Tailwind não cobre, CSS variables em runtime, libs de terceiros).
- Preferir a **escala do Tailwind** a valores arbitrários: `p-3` (12px) em vez de `p-[12px]`; `gap-4` em vez de `gap-[16px]`; `text-sm` / `rounded-md` etc. Arbitrary (`[…]`) só quando não houver token equivalente na escala.
- Não criar folhas `.css` novas para layout/espaçamento/cores de componente — use utilitários Tailwind (classes utilitárias em `globals.css` existentes são exceção histórica; não espelhar esse padrão).

### Cores

- Evitar cores hardcoded (`#13335a`, `bg-[#…]`, `text-blue-500` ad-hoc).
- Preferir tokens do design system definidos em [`src/app/globals.css`](../../src/app/globals.css) e expostos ao Tailwind (`bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, etc.).
- Se precisar de um token novo, adicionar em `globals.css` (`:root` / `@theme`) e usar a classe gerada — não espalhar hex no JSX.

### Ícones

1. Procurar primeiro em [`src/assets/icons/`](../../src/assets/icons/) (barrel: `src/assets/icons/index.ts`). Preferir esses componentes (props tipadas via `IconProps`).
2. Se **não** houver ícone adequado: usar `lucide-react` como fallback **e** deixar explícito na descrição do PR / comentário de review que **não existe ícone correspondente em `src/assets/icons`** (para o time decidir se cria um asset depois).
3. Não adicionar SVGs soltos em pastas aleatórias sem alinhar com o padrão de `src/assets/icons`.

## Performance / RSC

- Minimizar `'use client'`, `useEffect` e `useState`; favor Server Components.
- Client components em Suspense com fallback quando fizer sentido.
- Dynamic import para componentes não críticos.
- Imagens: WebP quando possível, tamanhos definidos, lazy loading.

## Estado e URL

- Dados server: RSC / Server Actions / DAL.
- Dados client interativos: TanStack Query.
- Forms: React Hook Form + Zod.
- **URL search params:** usar `searchParams` (server) ou `useSearchParams` (client). **Não** introduzir `nuqs` a menos que a tarefa peça explicitamente (não está no projeto).

## Qualidade

- Lint/format: Biome (`npm run lint`, `npm run format`).
- Types: `npm run typecheck`.
- Unit: Vitest (`npm run test:run`). E2E: Playwright (`npm run test:e2e`).
- Hooks: `lefthook.yml` (format no commit; checks no push).

## Next.js

Antes de APIs/padrões de framework, consultar `node_modules/next/dist/docs/` (ver `AGENTS.md`).
