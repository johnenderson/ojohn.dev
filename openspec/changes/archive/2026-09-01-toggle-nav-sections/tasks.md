## 1. Configuração central

- [x] 1.1 Criar `src/lib/section-flags.ts` exportando `SECTION_FLAGS` (`{ contact: false, uses: false }`) e o tipo `SectionKey` derivado dele; verificar rodando `yarn typecheck` sem erros

## 2. Navbar lê a configuração central

- [x] 2.1 Em `src/base/components/Navbar/Navbar.tsx`, adicionar a chave `section: SectionKey` aos itens `uses` e `contact` no array `navLinks`, remover o `disabled: true` fixo do item `contact`, e calcular o estado desativado de cada item em tempo de render a partir de `SECTION_FLAGS[section]` (itens sem `section` nunca ficam desativados); verificar rodando `yarn dev` e conferindo visualmente que "Uso" e "Contato" aparecem como itens não-clicáveis com "em breve" tanto no menu desktop quanto no mobile, e que os demais itens (Blog, Sobre mim, Agora) continuam navegáveis normalmente

## 3. Bloqueio de rota para seção desativada

- [x] 3.1 Em `app/uses/page.tsx`, importar `SECTION_FLAGS` e chamar `notFound()` no início do componente quando `SECTION_FLAGS.uses` for `false`; verificar acessando `/uses` diretamente no navegador (com `yarn dev` rodando) e confirmando que retorna a página de não encontrado

## 4. Sitemap omite seção desativada

- [x] 4.1 Em `app/sitemap.ts`, importar `SECTION_FLAGS` e incluir a entrada `${SITE_URL}/uses` apenas quando `SECTION_FLAGS.uses` for `true`; verificar acessando `/sitemap.xml` em `yarn dev` e confirmando que a URL `/uses` está ausente enquanto a flag estiver desativada

## 5. Verificação final

- [x] 5.1 Rodar `yarn lint`, `yarn typecheck` e `yarn build` e confirmar que os três passam sem erros
- [x] 5.2 Com `SECTION_FLAGS.uses` temporariamente em `true` (edição local, não commitada), confirmar que "Uso" volta a aparecer como link navegável no menu, `/uses` volta a renderizar a página normalmente, e a URL volta a aparecer no sitemap — validando que o contrato de fonte única funciona nos dois sentidos antes de deixar o valor final como `false`
