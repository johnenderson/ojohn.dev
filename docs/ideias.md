# Ideias de inovação para o site

Brainstorm de funcionalidades que aproveitam a infra já existente (Upstash Redis,
integrações Last.fm/Spotify/Steam/Riot/GitHub, MDX server-side, OG images) ou
expandem a identidade do site. Organizado por esforço estimado.

## Aproveitando o que já existe (esforço baixo)

### 1. Trilha sonora do artigo ⭐

Ao publicar um artigo, salvar as faixas mais scrobbladas no Last.fm durante o
período de escrita e exibir no rodapé: _"escrito ao som de..."_.

- Conecta as duas identidades do site (dev + músico enferrujado).
- Implementação: chamada ao Last.fm no build (`user.getrecenttracks` com
  `from`/`to`) + campo opcional no frontmatter (`writingPeriod` ou as faixas
  já resolvidas).
- Ninguém tem isso.

### 2. Histórico do status ao vivo

O `/api/status` já detecta jogando/ouvindo/codando, mas só mostra o instante.
Gravar snapshots no Redis (sorted set por dia) e renderizar uma timeline
tipo heatmap na `/now`: "minha semana real", com as sequências de LoL às 23h.

- Infra: mesmo padrão de `cacheSet`, com chave `status:history:<data>`.
- Cuidado com cardinalidade/cota do Upstash — agregar por hora basta.

### 3. Reações por parágrafo

Estender a infra de likes (Redis + rate limit + whitelist de ids) para reações
ancoradas em headings (`👍 🔥 🤯` por seção do artigo).

- Descobre _qual parte_ do artigo ressoa, não só se o artigo agradou.
- Implementação: chave `reactions:<likesId>:<headingSlug>:<emoji>`, whitelist
  gerada a partir dos slugs do rehype-slug no build.

### 4. Stats públicos do site

Página `/stats` estilo "open startup": views por artigo (contador no Redis,
mesmo padrão dos likes), likes totais, status das integrações.

- Transparência combina com site de dev.
- Contador de views: `INCR` no Redis por rota, com dedupe simples por IP+dia.

## Diferenciais de conteúdo (esforço médio)

### 5. Grafo de conhecimento entre artigos ⭐

Wiki-links `[[assim]]` no MDX, resolvidos no build (o registry de conteúdo
gerado por script já existe), com um grafo navegável em `/blog`.

- Já houve um `links-graph` na base (removido como código morto em jul/2026) —
  a ideia claramente já rondava. A versão boa começa pelos dados (links entre
  artigos), não pelo componente visual.
- Com poucos artigos o grafo é simples, e cresce junto com o site.

### 6. Diagramas interativos nos artigos de infra

Componente MDX de diagrama AWS/K8s onde hover explica cada peça — ou um
"simulador" (ex.: NodePool do Karpenter provisionando nós conforme você
adiciona pods).

- Os artigos são de infra (Karpenter, Datadog): é onde diagrama interativo
  mais agrega.
- O pipeline de componentes MDX customizados já está montado (Venn,
  Admonition etc. como referência).

### 7. Modo terminal (easter egg)

Apertar `~` abre um terminal fake onde `ls blog/`, `cat uses`, `whoami`,
`cd now` funcionam e navegam o site.

- Barato, memorável, e o público de blog de backend é exatamente quem curte.

## Mais ousado (esforço alto)

### 8. "Pergunte ao meu blog" ⭐

Busca semântica + Q&A sobre os artigos com a Claude API: embeddings dos MDX
gerados no build, endpoint com rate limit (infra pronta) e resposta em
streaming citando o artigo-fonte.

- Rende um artigo por si só ("como construí um RAG do meu blog").
- Atenção a custo: cache agressivo de respostas no Redis + rate limit por IP.

### 9. Guestbook com GitHub OAuth

Assinaturas de visitantes autenticados via GitHub (avatar + username), tudo
no Redis.

- Autenticação controla spam de graça.
- NextAuth/Auth.js com provider GitHub resolve o OAuth.

## Recomendação

Top 3 pela relação impacto/custo e identidade do site:

1. **Trilha sonora do artigo** (#1) — único, custo mínimo.
2. **Grafo de conhecimento** (#5) — efeito composto conforme o blog cresce.
3. **Pergunte ao meu blog** (#8) — o mais "inovador" e ainda vira conteúdo.
