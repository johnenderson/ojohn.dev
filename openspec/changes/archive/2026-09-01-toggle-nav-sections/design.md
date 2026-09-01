## Context

Ver `proposal.md` - Por quê. Hoje o único mecanismo existente é um `disabled: true` solto por item dentro do array `navLinks` em `src/base/components/Navbar/Navbar.tsx`, consumido separadamente pelo render desktop e pelo render mobile do mesmo componente. Não há nenhum outro arquivo lendo esse estado — `app/uses/page.tsx` e `app/sitemap.ts` não têm hoje nenhuma noção de seção "desativada".

## Goals / Non-Goals

**Goals:**
- Uma única configuração, importável por qualquer arquivo do projeto, que decide se uma seção está ativa.
- `Navbar.tsx`, `app/uses/page.tsx` e `app/sitemap.ts` todos derivam o estado de uma seção dessa mesma configuração — nunca de uma cópia local.
- Adicionar/alternar uma seção deve ser uma mudança de uma linha, num único arquivo.

**Non-Goals:**
- Não é um sistema de feature-flag genérico (sem runtime toggle, sem env var, sem painel admin) — é um interruptor estático, editado no código, para as seções de navegação do site.
- Não cria a página `/contact` nem qualquer outra rota nova.
- Não altera o comportamento de itens de menu que não têm toggle (`blog`, `me`, `now` permanecem sempre ativos, sem participar dessa configuração).

## Decisions

### Formato da configuração: objeto literal tipado, não array
```ts
// src/lib/section-flags.ts
export const SECTION_FLAGS = {
  contact: false,
  uses: false,
} as const satisfies Record<string, boolean>;

export type SectionKey = keyof typeof SECTION_FLAGS;
```
Um objeto por chave (`contact`, `uses`) permite `SECTION_FLAGS.uses` diretamente nos três pontos de consumo, sem precisar de `.find()`/lookup por array. `SectionKey` deriva do próprio objeto, então adicionar uma seção nova (ex.: `now: false`) já propaga o tipo para quem for usá-la — TypeScript aponta qualquer lugar que precise ser atualizado.

Alternativa considerada: array de `{ key, enabled }`. Rejeitada por exigir busca linear em todo ponto de consumo, sem ganho real sobre o objeto.

### Local do arquivo: módulo dedicado, não `src/lib/site.ts`
`src/lib/site.ts` hoje guarda apenas constantes estáticas de metadata (`SITE_NAME`, `SITE_URL`, ...). Alternar seções é uma preocupação diferente (estado de feature, não metadata do site), então fica em `src/lib/section-flags.ts` próprio — um único lugar óbvio de achar e editar, sem misturar com metadata.

### `Navbar.tsx` ganha uma chave `section` opcional por item
```ts
const navLinks = [
  { href: '/blog', label: 'Blog', icon: faNewspaper },
  { href: '/me', label: 'Sobre mim', icon: faUser },
  { href: '/now', label: 'Agora', icon: faHeadphones },
  { href: '/uses', label: 'Uso', icon: faScrewdriverWrench, section: 'uses' },
  { href: '/contact', label: 'Contato', icon: faEnvelope, section: 'contact' },
];
```
O estado "desativado" de cada item passa a ser calculado no render (`section ? !SECTION_FLAGS[section] : false`) em vez de armazenado como `disabled: true` fixo no array. Itens sem `section` (Blog, Sobre mim, Agora) nunca são desativados por essa configuração. O render desktop e mobile continuam com a mesma lógica visual de hoje ("em breve"), só troca a fonte do booleano.

Alternativa considerada: manter `disabled: true/false` direto no array, apenas movendo o valor para vir de `SECTION_FLAGS` no momento de montar o array. Rejeitada porque isso ainda deixaria o array como única fonte visível — outros arquivos (`page.tsx`, `sitemap.ts`) precisariam importar o array inteiro do componente de UI para ler um booleano, criando acoplamento estranho de "route/sitemap importa de dentro de um componente React". A chave `section` resolve isso: todos importam do módulo de config, não um do outro.

### Bloqueio de rota via `notFound()` no topo do Server Component
```ts
// app/uses/page.tsx
import { notFound } from 'next/navigation';
import { SECTION_FLAGS } from '@/lib/section-flags';

export default function UsesPage() {
  if (!SECTION_FLAGS.uses) notFound();
  // ...resto do componente inalterado
}
```
Segue a convenção já usada em `app/blog/[...slug]/page.tsx` e `app/og-preview/[...slug]/page.tsx` — nenhum padrão novo introduzido no projeto.

### Sitemap filtra a entrada condicionalmente
```ts
// app/sitemap.ts
...(SECTION_FLAGS.uses
  ? [{ url: `${SITE_URL}/uses`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 }]
  : []),
```

## Risks / Trade-offs

- [Alguém adiciona uma seção nova ao `navLinks` com `section` apontando para uma chave que não existe em `SECTION_FLAGS`] → Mitigado pelo tipo `SectionKey`: o TypeScript recusa compilar se a chave não existir no objeto de config.
- [Alguém muda `contact: true` no futuro sem a página `/contact` existir, e o link do menu passa a apontar para uma rota que não existe] → Fora do escopo desta mudança (a proposta já registra que `/contact` não existe); fica como responsabilidade de quem ligar essa flag no futuro, não algo que este design precisa resolver agora.
- [Esquecer de espelhar o toggle em algum dos três pontos (menu, rota, sitemap) ao adicionar uma seção nova] → Mitigado pelo próprio objetivo do design: os três pontos leem do mesmo `SECTION_FLAGS`, então não há cópia para esquecer de atualizar.

## Migration Plan

Mudança local, sem estado persistente, sem múltiplos ambientes a coordenar: as quatro edições (`section-flags.ts` novo, `Navbar.tsx`, `app/uses/page.tsx`, `app/sitemap.ts`) entram juntas em um único commit. Verificação manual pós-implementação: menu mostra "Uso" e "Contato" como "em breve"; acessar `/uses` diretamente retorna 404; `/uses` não aparece no sitemap gerado. Rollback é reverter o commit, sem migração de dados envolvida.
