# Conteúdo HTML da Carta de Serviços

Acordo do que o artigo publicado pode trazer e do que o pref.rio mostra no detalhe do serviço.

O portal lê a API da Carta (`info`, `howToRequest`, `legislation`, `buttons`). Quem edita no Salesforce continua com o controle de acesso de lá. O portal, na hora de mostrar, fica só com a formatação combinada abaixo. Se vier uma imagem, uma tabela ou um script, esse pedaço não aparece. O resto da página abre normalmente. O cidadão não vê erro.

## O que a tela usa


| Na tela                                       | Campo da API                                                   | Formato               |
| --------------------------------------------- | -------------------------------------------------------------- | --------------------- |
| Resumo, embaixo do título                     | `info.summary`                                                 | HTML                  |
| Descrição completa do serviço                 | `info.fullDescription`                                         | HTML                  |
| Como solicitar                                | `howToRequest.instructions`                                    | HTML                  |
| Resultado da solicitação                      | `howToRequest.serviceResult`                                   | HTML                  |
| O que o serviço não cobre                     | `howToRequest.exclusions`                                      | HTML                  |
| Cada documento necessário                     | cada item de `howToRequest.requiredDocs`                       | HTML ou texto puro    |
| Legislação                                    | `legislation[].titulo`                                         | Em aberto. Ver abaixo |
| Nome do serviço, custo, prazo, texto do botão | `name`, `info.cost`, `info.serviceDeadline`, `buttons[].title` | Texto puro            |
| Destino do botão                              | `buttons[].url`                                                | URL, fora do HTML     |


## Formatação que aparece

Parágrafo, quebra de linha, títulos de segundo a quarto nível, negrito, itálico, sublinhado, lista com marcador e lista numerada.

Link com endereço absoluto:

- `https://…`
- `http://…`
- `mailto:…`
- `tel:…`

O portal abre o link em uma nova aba. O `target` que vier no HTML é ignorado. Vale o comportamento do portal.

## Formatação que não aparece

Imagem, tabela, cor, título de primeiro nível (`h1`), vídeo, formulário e link relativo (`/servico` ou `www.site.com` sem `https://`).

Um link `javascript:` ou `data:` também sai. O texto do link pode permanecer. O endereço, não.

## Legislação: falta escolher um formato

Os outros campos ricos já chegaram em HTML. O título da legislação chegou de dois jeitos.

Na avaliação de risco de queda da árvore, com link em markdown:

```text
[Decreto n° 28.328 de 17 de agosto de 2007 - …](http://www.rio.rj.gov.br/dlstatic/10112/2565214/DLFE-240304.pdf/1.0)
```

No agendamento de vistoria de táxi, só a frase, sem link:

```text
DECRETO RIO Nº 48072 DE 22 DE OUTUBRO DE 2020 - Aprova o Regulamento…
```

Enquanto isso não for um formato só, o portal trata `legislation[].titulo` como markdown. A frase solta aparece como texto. O padrão `[título](url)` vira um link.

Para fechar, uma destas três:

1. Texto puro, sem link.
2. Markdown `[título](url)`, como na árvore.
3. HTML `<a href="https://…">título</a>`, no mesmo acordo dos outros campos.

## Documentos necessários

`howToRequest.requiredDocs` é uma lista. Cada item é um documento.

`CPF;` aparece como texto. `<p>RG</p>` aparece como parágrafo. Os itens não são juntados numa lista única pelo portal. Se a lista inteira vier dentro de um único item, a tela mostra um bloco só.



