# Ideas

Backlog de ideias para o site. Nada aqui é compromisso — é um lugar para não
perder boas ideias.

---

## GitHub API

Todas com dados públicos via API oficial (GraphQL/REST).

### Vitrine de projetos

- [ ] **📌 Projetos em destaque** — `pinnedItems` (GraphQL): repos fixados no
      perfil (descrição, ⭐, linguagem, última atualização). Portfólio
      auto-curado (você controla pinando no GitHub). Local: home, `/projects`
      ou `/now`.
- [ ] **⭐ Total de estrelas** — soma de `stargazerCount` dos repos públicos.
      Stat curto e impactante; reaproveita a query de linguagens. Cabe no card
      "Pulso de dev". Esforço: ~15 min.

### Enriquecer a seção "Código" (`/now`)

- [ ] **🧩 Como eu contribuo** — donut/barras de commits vs PRs vs issues vs
      reviews (`contributionsCollection.total*Contributions`). Custo ~zero:
      reaproveita o `contributionsCollection` que já buscamos.
- [ ] **🌍 Onde eu contribuo** — `commitContributionsByRepository` filtrando
      repos de terceiros. Mostra a pegada open source / envolvimento na
      comunidade.

### Interesses (combina com a vibe da `/now`)

- [ ] **❤️ O que tenho curtido** — REST `/users/{user}/starred?sort=created`:
      últimos repositórios favoritados. Equivalente dev do "últimas músicas"
      do Last.fm.

**Prioridade sugerida:** 1) 🧩 Como eu contribuo (mais barato), 2) 📌 Projetos
em destaque (maior lacuna do site hoje), 3) ❤️ O que tenho curtido (mais
único).

---

## UX / Interatividade

- [ ] **⌨️ Command Palette (Cmd+K)** — busca global de artigos + navegação
      rápida + comandos (mudar tema, mudar fonte, copiar e-mail). Usar `cmdk`.
      Baixo esforço, alto polish — o tipo de detalhe que faz visitantes
      técnicos prestarem atenção. Esforço: baixo.

- [ ] **🟢 Live Status Widget** — dot animado na navbar/home deduzindo status
      automaticamente: Spotify tocando → "ouvindo música", League online →
      "jogando", commit recente → "codando". Complementa perfeitamente a
      identidade da `/now`. Esforço: médio.

- [ ] **🗺️ Knowledge Graph Interativo** — mapa mental visual das tecnologias e
      como elas se conectam (Java → Spring → Kubernetes → AWS). Click em um nó
      abre artigos relacionados. Tecnologia: D3.js ou `react-force-graph`. Raro
      em portfólios dev, muito visual, demonstra profundidade de conhecimento.
      Esforço: alto.

- [ ] **🔍 Full-text Search + Filtros Avançados** — busca em artigos com filtros
      por data, tags, tempo de leitura. Tecnologia: Typesense (self-hosted) ou
      Algolia (free tier). Esforço: médio.

---

## Conteúdo & Narrativa

- [ ] **📅 Timeline Visual de Carreira** — linha do tempo animada em `/me` ou
      `/timeline` com marcos (cargos, projetos, certificados). Filtros por
      categoria (trabalho, educação, open source). Transforma a bio estática em
      narrativa. Esforço: médio.

- [ ] **📚 Bookshelf** — lista curada de livros lidos com capa, rating pessoal
      e snippet de review. Visualização como capas stacked. Fonte: Notion
      database (Goodreads API foi deprecada). Esforço: médio.

- [ ] **🎬 Letterboxd / Filmes** — filmes assistidos recentemente com rating,
      análogo ao Last.fm para filmes. Sem API oficial, mas há workarounds via
      RSS. Humaniza o perfil. Esforço: baixo.

---

## Integrações Técnicas

- [ ] **⏱️ Wakatime** — horas de código/semana, linguagens, IDEs, dias mais
      produtivos. Complementa ou substitui a seção CodingRhythm. Esforço: baixo
      (requer conta no Wakatime).

- [ ] **📺 YouTube / Podcast** — conteúdo consumido recentemente (YouTube
      watched history ou Pocket Casts). Like Last.fm mas para aprendizado via
      vídeo/podcast. Esforço: médio.

---

## Performance & SEO

- [ ] **📊 Performance Dashboard público** — exibir Core Web Vitals (LCP, CLS,
      FID) do site em `/about` ou rodapé via Vercel Analytics. Demonstra
      obsessão por qualidade. Esforço: baixo.

- [ ] **📈 Article Analytics** — ranking público de artigos por visualizações
      e tempo médio de leitura. Badges ("mais lido", "mais longo"). Esforço:
      médio.

- [ ] **🏷️ JSON-LD Schema enriquecido** — ir além do básico; schema markup
      detalhado para `Person`, `BlogPosting` e `SoftwareSourceCode`. Melhora
      Rich Snippets no Google. Esforço: baixo.

---

## Comunidade & Engajamento

- [ ] **💬 Comentários via Giscus** — GitHub Discussions como backend de
      comentários nos artigos. Zero infraestrutura própria. Esforço: baixo.

- [ ] **📬 Newsletter** — CTA sutil no rodapé/artigos para receber novos posts + curadoria mensal. Tecnologia: Resend ou Substack embed. Esforço: baixo.

- [ ] **🔗 Share & Highlight de Trechos** — seleção de texto gera link
      compartilhável ou botão de tweet (tipo Medium). Viral potential sutil.
      Esforço: baixo.

---

## Outras pendências

- [ ] Testes automatizados (parser de artigos em `articles.ts`, `parseArticleDate`,
      `getArticleNavigation`).
- [ ] CSP (`Content-Security-Policy`) — exige testar em produção por causa de
      scripts/estilos inline e dos embeds de tweet.

---

## Roadmap sugerido

### Fase 1 — Baixo esforço, alto impacto (2–3 semanas)

1. ⭐ Total de estrelas nos repos (15 min)
2. 🧩 Como eu contribuo (reaproveita API existente)
3. 📌 Projetos em destaque (`/projects`)
4. ⌨️ Command Palette (Cmd+K)
5. 🏷️ JSON-LD schema enriquecido

### Fase 2 — Médio esforço (4–6 semanas)

1. 🟢 Live Status Widget
2. 📅 Timeline visual de carreira
3. 📊 Performance Dashboard público
4. 📈 Article Analytics + sorting em `/writings`
5. 💬 Giscus (comentários)

### Fase 3 — Alto esforço / diferencial máximo (6+ semanas)

1. 🗺️ Knowledge Graph interativo
2. 📺 YouTube / Podcast integration
3. 📬 Newsletter
4. 🔍 Full-text Search
