# Pré-visualização da carta de serviços

O botão **Pré-visualizar** fica no editor da Carta (`richTextBubbleEditor`, junto de “Finalizar edição”). Ele abre a ficha real do pref.rio e entrega o rascunho por `postMessage`. O Apex monta o JSON com `buildPreviewPayload`; o portal valida, sanitiza e desenha com os mesmos componentes da página publicada. Nada é gravado.

A faixa “Pré-visualização — este serviço não está publicado” aparece em todo preview, inclusive quando o artigo está Online e a tela tem edição não salva.

## Fluxo

1. O editor gera um nonce (`crypto.randomUUID()`) e abre, no clique, `https://<origem-do-pref.rio>/servicos/preview#<nonce>` na aba `prefrio-preview`. O `window.open` é síncrono e sem `noopener`.
2. Se a página tiver `window.opener`, ela manda `prefrio-preview-ready` com esse nonce para a origem do Lightning. Repete a cada 300 ms por até 5 segundos.
3. O LWC responde `prefrio-preview-data` com o mesmo nonce e o payload. O clique também manda o payload na hora, para o caso de o `ready` chegar na outra aba.
4. O pref.rio faz `POST /api/preview/servicos`, valida e sanitiza. HTML proibido é removido e a resposta continua sucesso.
5. Se o POST falha ou ninguém manda o payload em 5 segundos, a página manda `prefrio-preview-error` e mostra o aviso na aba.
6. Depois do resultado, a página zera `window.opener`. Um refresh devolve o opener e o `ready` roda de novo. Um segundo clique troca o hash; a mesma aba escuta o nonce novo.

Quem cola a URL sem a aba do Lightning vê o pedido para abrir pelo botão. O GET não traz o serviço.

## Mensagens

As duas janelas só aceitam a origem da outra. Nunca `*`. O nonce do hash é a validação principal: sob LWS, `event.source === previewWindow` pode falhar, então o portal não exige `event.source === window.opener`.

| `type` | Quem envia | Corpo |
| --- | --- | --- |
| `prefrio-preview-ready` | pref.rio | `{ nonce }` |
| `prefrio-preview-data` | Lightning | `{ nonce, payload }` ou a mesma mensagem como string JSON |
| `prefrio-preview-error` | pref.rio | `{ nonce, code }` |

`code` é um destes: `payload_too_large`, `invalid_payload`, `timeout`, `rate_limited`. O erro não inclui o HTML nem o body.

Sob LWS todo objeto criado no LWC é um Proxy, e `postMessage` com objeto lança `DataCloneError`. O Salesforce envia `prefrio-preview-data` como string JSON. O portal faz `JSON.parse` antes de validar, só depois de conferir a origem. String inválida ou maior que 1 MB é ignorada, sem erro de volta. O formato do objeto continua o mesmo, e o `POST` leva só o `payload`. O mesmo nonce, na mesma abertura, gera um único POST. `ready` e `error` continuam objetos.

O portal devolve o erro para `event.source` (a aba que mandou os dados). O `timeout`, que ocorre antes de qualquer mensagem, vai para o `window.opener`.

Duas abas do Lightning na v1: a janela nomeada é a mesma, e o `ready` pode ir para a primeira. O nonce separa os payloads. Não há `activeTabId` nesta versão. O clique que abriu manda o payload na hora; o `ready` da aba certa reenvia.

## O que o LWC faz

`PrefRio_Origin__c` vem da CMDT. O listener entra antes do `window.open`.

```javascript
const PREVIEW_WINDOW = 'prefrio-preview'

async handlePreview() {
  const origin = this.previewOrigin
  if (!origin || !this.previewAtivo) return

  const nonce = crypto.randomUUID()
  const win = window.open(
    `${origin}/servicos/preview#${nonce}`,
    PREVIEW_WINDOW
  )
  if (!win) return
  this.previewWindow = win
  this.previewNonce = nonce

  const payload = await buildPreviewPayload({
    recordId: this.recordId,
    overridesJson: JSON.stringify(this.montarOverrides()),
  })
  this.sendPayload(payload)
}

onMessage(event) {
  if (event.origin !== this.previewOrigin) return
  if (event.data?.nonce !== this.previewNonce) return
  if (event.data?.type === 'prefrio-preview-ready') this.sendPayload()
  if (event.data?.type === 'prefrio-preview-error') {
    this.toast(event.data.code)
  }
}

sendPayload(payload = this.payload) {
  this.payload = payload
  this.previewWindow?.postMessage(
    { type: 'prefrio-preview-data', nonce: this.previewNonce, payload },
    this.previewOrigin
  )
}
```

No Lightning, o `postMessage` manda essa mesma mensagem como string JSON. O objeto do exemplo continua aceito.

CSP Trusted Sites: testar sem. Só cadastrar a origem do pref.rio se o org bloquear o `window.open` ou o `postMessage`.

## Payload

O body do `POST /api/preview/servicos` é o objeto de dentro do `ServiceDetail`, o mesmo `data` que a ficha publicada consome. O envelope `{ "data": ... }` do app-catalogo não é o body: a chave `data` é ignorada e o artigo não entra.

O body tem tetos: texto curto 2 mil caracteres, HTML 20 mil, no máximo 50 documentos ou canais e 20 botões. Chave desconhecida é ignorada. Body acima de 1 MB responde `413` / `payload_too_large`.

Campo escalar opcional aceita ausência ou `null` (`costValue`, `costNotes`, `serviceDeadlineNotes` e os demais textos, números e booleanos). Lista continua sendo array; lista vazia passa.

`version`, se vier, tem que ser o número `1`. Sem o campo, ou com `null`, o contrato também é o v1. Outro número responde `invalid_payload`.

O fixture que passa no schema está em `src/lib/carta-servicos/__tests__/fixtures/preview-service.json`.

- **slug.** A rota de preview não usa. Em rascunho novo, omitir. Não mandar placeholder.
- **requiredDocs.** Array de string. Cada item é HTML ou texto puro e passa pelo sanitizer. Partir a lista com o mesmo `parseHtmlToList` da API pública.
- **targetAudience.** Array de string com o valor de API, por exemplo `Publico_em_geral`. Não é o rótulo da tela. O schema aceita. A ficha atual não desenha público-alvo: o campo não aparece na v1.
- **channels, buttons, legislation.** O shape do `ServiceDetail`. `Presencial` vira endereço. `Digital` e `Telefone` entram nos canais digitais. `whatsappLink` tem prioridade.
- **articleStatus.** Qualquer string curta passa. Só `Draft` vira status não publicado no mapper. Forçar `Draft` no Apex está certo. A faixa de preview não depende disso.
- **flags.activeCategoryConfigId.** Opcional. Com `allowTicketSubmission`, os botões de chamado aparecem e não navegam. Sem categoria, omitir `flags`. `slugHistory` também é opcional: o portal não exige query extra para a tela abrir.
- **Clone com overrides.** O portal não chama Salesforce. Serve qualquer JSON final igual ao fixture. Tema, órgão, canais, legislação e links que o editor não altera podem vir do registro salvo.

HTML que permanece: parágrafo, quebra de linha, `h2` a `h4`, negrito, itálico, sublinhado, listas e link `https`, `http`, `mailto` ou `tel`. `div`, `style`, `span`, imagem, tabela, script e link `javascript:` ou `data:` saem. O texto de dentro de uma tag removida permanece. A página publicada já perde a mesma formatação.

O preview sempre renderiza HTML, com a flag de preview ligada. Ele não lê `CARTA_SERVICOS_API_ENABLED`. Essa flag da carta publicada está ligada em Staging e desligada em produção: em produção a ficha no ar ainda é markdown, e o preview, quando ligado, já é HTML.

`PREVIEW_CARTA_SERVICOS_ENABLED` é outra flag, só do servidor. Ausente ou diferente de `true` deixa `/servicos/preview` e `POST /api/preview/servicos` em 404, sem validar e sem contar no limite. O padrão é desligada. A flag da carta publicada não liga esta rota.

## Segurança

- Origem na allowlist `SALESFORCE_PREVIEW_ORIGINS` (domínio exato, sem wildcard e sem path) e nonce igual ao hash.
- `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store` na rota.
- Google Analytics e Google Tag Manager (por onde o Hotjar entra) não carregam em `/servicos/preview`. O clique de serviço também não dispara analytics.
- `POST /api/preview/servicos`: 30 pedidos por minuto por IP, nesta instância. Sem Redis no superapp, outro pod não vê o contador. A resposta de limite é `429` / `rate_limited`.
- O body não entra em log nem em span. O erro Zod não devolve o payload.

## Ambientes

| Salesforce | pref.rio | Carta publicada | Preview |
| --- | --- | --- | --- |
| Produção | `https://pref.rio` | `CARTA_SERVICOS_API_ENABLED` desligada (markdown) | só com `PREVIEW_CARTA_SERVICOS_ENABLED=true` |
| Staging | `https://staging.app.dados.rio` | flag da carta ligada (HTML) | só com a flag de preview |
| QA | sem conexão | — | botão oculto |

A origem do `postMessage` é só o host do Lightning, sem path e sem barra no fim.

- Staging do Lightning: `https://prefeitura-rio--staging.sandbox.lightning.force.com`. O editor abre em `/lightning/r/Knowledge__kav/...`; isso não entra na allowlist.
- Produção do Lightning: `https://prefeitura-rio.lightning.force.com`. `SALESFORCE_PREVIEW_ORIGINS` de produção fica vazio até o preview ser ligado.
- QA do Lightning: `https://prefeitura-rio--qa.sandbox.lightning.force.com`. Fica de fora enquanto o preview desse ambiente estiver desligado.
- `https://1746.staging.app.dados.rio` e `https://1746.pref.rio` ficam de fora. São o portal do 1746, não a janela do editor.

A rota continua atrás da flag de preview, desligada até alguém setar `PREVIEW_CARTA_SERVICOS_ENABLED=true`. Ela ainda não está na `main`.
