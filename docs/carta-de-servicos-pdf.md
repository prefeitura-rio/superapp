# Carta de Serviços ao Usuário — download em PDF

Lei Federal nº 13.460/2017. Entrada provisória no footer (coluna **Menu**, 3º item),
listagem de órgãos, tela do órgão e download da carta daquele órgão em PDF A4.

## Rotas

| Rota | O que é |
|------|---------|
| `/carta-de-servicos` | Texto da Lei ("Ver mais"/"Ver menos") + órgãos em ordem alfabética, "Nome do ente - Sigla" |
| `/carta-de-servicos/{siciCode}` | Título do órgão, botão **Baixar documento**, serviços com link para a tela do serviço |
| `GET /api/carta-de-servicos/{siciCode}/pdf` | Route Handler que devolve o PDF (`carta-de-servicos-{sigla}.pdf`) |

As duas páginas são públicas (`publicRoutes` no middleware); `/api/*` não passa pelo middleware.

## Dados (app-catalogo)

- `GET /api/public/org-units`: só órgãos com ≥1 serviço publicado. Mesmo assim o front
  descarta item sem `responsibleOrgUnitSiciCode`.
- `GET /api/public/org-units/{siciCode}/services`: detalhe completo dos serviços. O front
  refiltra: só `responsibleOrgUnitSiciCode === siciCode`, sem `articleStatus === 'Draft'`.
- Os dois paginam (`per_page` ≤ 100). `fetchAllCartaPages` lê a página 1, pega
  `meta.total_pages` e busca o resto em paralelo. Se **qualquer** página falha, falha tudo:
  lista ou carta com buraco é pior que erro explícito.
- `GET /api/public/services` (carta geral, "Todas as secretarias") está no client Orval
  mas **não** é usado: fora do lançamento.
- Fetch com `revalidate: 600` e sem cookie (`isCartaPublicNavigationPath` em
  `custom-fetch-app-catalogo.ts`), para as páginas continuarem estáticas/ISR.

Código: `src/lib/carta-servicos/org-units.ts`.

## Decisão: o PDF nasce no servidor

**Escolhido: servidor (Route Handler Node + `@react-pdf/renderer`).**

| Critério | Servidor | Cliente |
|----------|----------|---------|
| Dados | `BASE_API_URL_APP_CATALOGO` é env de servidor; pagina e filtra perto da API | O navegador teria que paginar a app-catalogo (CORS, URL pública) e baixar todo o JSON (~0,9 MB na SMFP) |
| Peso para o cidadão | Zero JS extra | react-pdf + yoga + fontkit no bundle (centenas de KB gzip) e CPU de celular de entrada por vários segundos |
| Consistência | Mesmo arquivo para todo mundo, testável no CI | Depende de navegador/memória do aparelho |
| Cache | Cache em memória de 10 min por órgão, então o segundo pedido sai em ~0,2 s | Cada cidadão gera de novo |
| Custo | CPU do pod enquanto gera (ver limites abaixo) | Nenhum no servidor |

Descartados:

- **pdf-lib** (já no projeto, usado nos certificados): ótimo para preencher template,
  mas não tem layout. Quebra de linha, paginação, listas e índice teriam que ser escritos
  à mão.
- **Puppeteer/Chromium (HTML → PDF)**: fidelidade boa, mas são +100 MB na imagem e um
  navegador rodando no pod. Desproporcional.

## Conteúdo do PDF

`src/lib/carta-servicos/pdf/`:

1. **Capa**: nome do órgão + sigla, linhas decorativas, identidade institucional.
2. **Índice**: apresentação, catálogo e cada serviço, com link interno (sem número de
   página; ver limites).
3. **Apresentação**: texto da Lei 13.460 (`LEI_13460_PARAGRAPHS`, o mesmo da listagem).
4. **Catálogo**: por serviço, título, datas ("Publicado em" usa `lastPublishedDate`, ou
   `createdDate` se faltar; "Modificado em" usa `lastModifiedDate`), O que é, resultados,
   prazo, custo, Como solicitar (HTML de `instructions` + canais estruturados: on-line,
   WhatsApp, telefone, presencial), informações necessárias, descrição do serviço, o que
   não cobre, legislação.

Rodapé fixo em todas as páginas: "Empresa Municipal de Tecnologia do Rio de Janeiro".
Cabeçalho fixo: logo Prefeitura do Rio. **Não há logo de secretaria em nenhuma página.**

O HTML do CMS (p, h3/h4, strong, em, ul/ol/li, a, br) vira primitivas do react-pdf em
`html-to-pdf.tsx`, com jsdom só para ler o DOM, sem executar nada. No papel, a URL de um
link aparece encurtada (`displayUrl`, máx. 64 caracteres) e o alvo clicável é a URL
completa. Endereços presenciais são link para o Maps, sem imprimir a URL.

## Limites conhecidos do react-pdf 4.9 (medidos aqui)

- **Custo quadrático num `<Page>` longo**: o catálogo inteiro num só `<Page>` levava ~91 s
  para a SMFP (146 serviços), com o event loop do Node travado. O catálogo é dividido em
  `<Page>`s de 6 serviços (`CATALOG_SERVICES_PER_PAGE`): ~8 s, 250 páginas. Cada lote
  começa em página nova.
- **`render` dinâmico em elemento `fixed` quebra a partir da 10ª página** ("unsupported
  number" no pdfkit). Por isso o rodapé não tem número de página e o índice não tem
  número de página.
- A geração ainda ocupa a thread do Node por alguns segundos nos órgãos grandes (SMFP ~8 s,
  SMTR ~7 s, mediana < 2 s). O cache em memória amortiza. Se virar problema, o próximo passo
  é gerar num `worker_thread` ou pré-gerar por cron.

## Pendências

- **Logo iplanrio**: a fonte é `public/carta-de-servicos/iplanrio.svg`. O react-pdf não lê
  SVG em `<Image>`, então o cabeçalho usa `iplanrio.png`, gerado a partir do SVG com o
  `sharp` (já instalado pelo Next). Ao trocar o SVG, gere o PNG de novo:
  `node -e "require('sharp')('public/carta-de-servicos/iplanrio.svg',{density:288}).png().toFile('public/carta-de-servicos/iplanrio.png')"`

## Pendências

- **Link para a tela do serviço** depende de `CARTA_SERVICOS_API_ENABLED=true`. Com a flag
  desligada, a tela do serviço usa a busca-search, que tem outros slugs, então os itens
  aparecem sem link em vez de levar a um 404.
