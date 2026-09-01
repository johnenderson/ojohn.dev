## Por quê

O item "Contato" no menu já é exibido como desativado ("em breve"), mas esse estado hoje vive como uma flag `disabled: true` solta dentro do `Navbar.tsx`, sem nada equivalente para bloquear o acesso à página em si. A seção "Uso" precisa do mesmo tratamento de liga/desliga, e repetir essa flag ad-hoc por seção facilita esquecer uma das pontas — por exemplo, desativar o link no menu e esquecer de bloquear a rota ou remover a entrada do sitemap, deixando uma página acessível (e indexável) que o menu diz estar "em breve".

## O que muda

- Cria um único módulo de configuração dedicado, listando cada seção que pode ser ligada/desligada (começando com `contact` e `uses`) como `enabled: boolean`.
- `Navbar.tsx` passa a ler essa configuração em vez de uma flag `disabled` inline por item: uma seção desativada continua aparecendo nos menus desktop e mobile, mas renderizada como não-interativa ("em breve") — mesmo comportamento visual/UX que o "Contato" já tem hoje.
- `app/uses/page.tsx` passa a ler a mesma configuração e chama `notFound()` quando a seção `uses` está desativada, bloqueando o acesso pela própria rota (seguindo a convenção já existente de `notFound()` usada em `app/blog/[...slug]/page.tsx` e `app/og-preview/[...slug]/page.tsx`).
- `app/sitemap.ts` passa a ler a mesma configuração e omite a entrada `/uses` quando a seção está desativada, para nunca listar para indexação uma página bloqueada.
- Define `uses: false` na nova configuração como parte desta mudança, fazendo "Uso" ficar desativado ("em breve") da mesma forma que "Contato" já está. `contact` mantém seu estado atual (`contact: false`), agora vindo da configuração compartilhada em vez da flag inline.

## Capacidades

### Novas capacidades
- `site-navigation/section-toggles`: configuração central que define quais seções do menu estão ativas/desativadas, e o contrato de que a renderização do menu, o acesso à rota e a listagem no sitemap derivam todos dessa mesma fonte única de verdade.

### Capacidades modificadas
(nenhuma — ainda não há specs existentes neste repositório)

## Impacto

- Novo arquivo: `src/lib/section-flags.ts` (ou nome similar) exportando a configuração de flags das seções.
- Modificado: `src/base/components/Navbar/Navbar.tsx` (renderização dos menus desktop e mobile passa a ler a configuração compartilhada em vez da flag `disabled` inline por item).
- Modificado: `app/uses/page.tsx` (ganha uma checagem `notFound()` no topo quando desativado).
- Modificado: `app/sitemap.ts` (omite `/uses` quando desativado).
- Sem mudanças em `app/contact/*` — essa rota ainda não existe; `contact` continua representado apenas na configuração compartilhada e no menu.
