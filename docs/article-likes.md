# Likes nos artigos

> **Status:** planejado — branch `feat/article-likes`. Este documento descreve o
> **desenho** e as **regras** da feature. O código ainda não foi implementado;
> a documentação vem primeiro de propósito, para fechar as decisões antes de
> escrever uma linha.

Contador de "aplausos" (estilo Medium) por artigo. Anônimo, sem login, simples
de manter — com a **identidade do like desacoplada do nome do arquivo**, para
nunca perder a contagem ao renomear/mover/traduzir um artigo.

---

## Visão geral

- **Modelo:** _clap_ (incrementa). O visitante clica e a contagem sobe. Não há
  "descurtir".
- **Onde o like mora de verdade:** **Upstash Redis** (já configurado no
  projeto), em **chave persistente, sem TTL**, usando `INCR` atômico.
- **Chave do like:** um `likesId` **imutável** no frontmatter do artigo —
  **nunca** o slug nem o nome do arquivo.
- **Degrada graciosamente:** sem o Redis configurado, o widget simplesmente não
  renderiza e o site continua funcionando (mesmo padrão das outras integrações).

### Por que Redis agora (e não Postgres)

O Upstash já está no projeto ([`src/lib/redis.ts`](../src/lib/redis.ts)) e o uso
está **baixíssimo**: ~4,8 mil de 500 mil comandos/mês, 4 KB de 256 MB, custo
**$0**. Reaproveitar elimina dependência nova, schema, migration e pooling — e
`INCR` é uma operação atômica feita sob medida para contadores. **Postgres fica
como plano de migração** (ver seção [Migração futura](#migração-futura-redis--postgres)),
para quando o uso crescer ou surgir necessidade de analytics/dedup/comentários.

### ⚠️ Redis SIM, TTL NÃO

O Redis aqui é usado hoje só como **cache com TTL** (Steam, LoL, Last.fm) — a
chave expira de propósito. **Like é o oposto: tem que ser durável.** Se uma
chave de like receber TTL, os likes **somem** quando o tempo acaba. Por isso a
chave de like é **persistente** (`INCR`, sem `ex`/`EXPIRE`) e vive num namespace
separado (`likes:`), sem usar o `cacheSet` atual.

---

## Como funciona (fluxo)

As páginas de artigo são **estáticas** (`generateStaticParams` em
[`app/blog/[...slug]/page.tsx`](../app/blog/[...slug]/page.tsx)), então a
contagem **não vem no HTML** — ela é buscada no cliente:

```text
[Página estática do artigo]
        │  renderiza <Likes likesId="a1b2c3" />
        ▼
[Client component]  ──GET /api/likes/a1b2c3──►  [Route handler dinâmico]
        │                                              │
        │  clique → POST otimista                       ▼
        └──POST /api/likes/a1b2c3───────────►  [Redis: INCR likes:a1b2c3]
                                                       │
        ◄──────────── { count } ───────────────────────┘
```

`localStorage` guarda **apenas** o estado visual ("você já aplaudiu") para
encher o ícone e evitar reenvio. A verdade fica no Redis.

---

## Identidade do artigo: `likesId`

Cada artigo ganha um campo **obrigatório, único e imutável** no frontmatter:

```mdx
---
title: 'Título do artigo'
description: 'Descrição curta'
date: '2026-01-05'
likesId: 'a1b2c3d4'   # ← permanente; NUNCA mude depois de publicado
---
```

- É a chave usada no Redis (`likes:<likesId>`).
- É **independente do slug/arquivo de propósito.** Isso é o que permite
  renomear, mover entre pastas ou traduzir o artigo sem perder os likes.
- Sugestão de geração: um id curto e estável (ex.: 8 caracteres alfanuméricos
  via `nanoid`/`crypto.randomUUID().slice(...)`). O que importa é ser único e
  nunca mudar.

> **Opção considerada:** fazer o `content:sync` **gerar e gravar** o `likesId`
> automaticamente quando faltar, para nenhum artigo nascer sem chave e ninguém
> esquecer. A decidir na implementação.

---

## Modelo de dados (Redis)

Uma chave por artigo, guardando um inteiro:

```text
likes:<likesId>   →   "42"      (string com o inteiro; sem TTL)
```

Operações:

```text
INCR likes:<likesId>   # incrementa atômico; cria em 1 se não existir. Retorna o novo total.
GET  likes:<likesId>   # lê o total (null → 0)
```

- `INCR` é **atômico** — sem race condition mesmo com cliques simultâneos.
- **Nenhum `EXPIRE` / `ex`** é aplicado: a chave é permanente.
- Namespace `likes:` é **separado** das chaves de cache (`steam:`, `lol:`,
  `lastfm:`), para nunca se confundirem.

A leitura pode reusar o `cacheGet` existente (é só um `GET`). A escrita usa um
helper **novo** (`incrementLikes`) com `redis.incr` — **não** o `cacheSet`, que
força TTL.

---

## Variáveis de ambiente

Nenhuma nova. Reaproveita o que o Redis já usa:

| Variável                   | Obrigatória | Usada por                          |
| -------------------------- | ----------- | ---------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | opcional\*  | Cache + likes nos artigos          |
| `UPSTASH_REDIS_REST_TOKEN` | opcional\*  | Cache + likes nos artigos          |

\* Como toda integração do site: se faltar, o widget de likes não renderiza e o
resto continua funcionando. São **server-only** — nunca expostas ao cliente.

---

## ⛔ O que NÃO fazer (regras)

Esta é a parte que mais importa documentar. Quebrar qualquer um destes itens
**zera ou corrompe** a contagem de likes — e, como são dados de visitantes
reais, não dá pra recuperar.

1. **NUNCA coloque TTL/`EXPIRE` numa chave de like.**
   Like é durável; TTL faz a chave (e os likes) sumirem na hora que expira. Use
   `INCR` em chave persistente. Em específico: **não use o `cacheSet`** (ele
   força `{ ex }`) para likes.

2. **NUNCA mude o `likesId` de um artigo já publicado.**
   É a chave permanente do like. Mudar = começar do zero. Tratá-lo como
   imutável, igual a uma chave primária.

3. **NUNCA reaproveite um `likesId`** em outro artigo.
   Dois artigos com o mesmo id somam likes no mesmo registro. Cada artigo tem o
   seu, único, para sempre.

4. **NUNCA dê `FLUSHALL`/`FLUSHDB` nem limpe o Redis "geral".**
   As chaves `likes:` convivem com as de cache no mesmo banco. Limpar tudo apaga
   os likes junto. Para mexer só no cache, opere por namespace (`steam:`, etc.),
   nunca no banco inteiro.

5. **NUNCA exponha os tokens do Redis ao cliente.**
   São server-only. Nada de `NEXT_PUBLIC_`, nada de importar o cliente do Redis
   em componente client. Toda escrita/leitura passa pela API route no servidor.

6. **NUNCA confie no like como métrica "séria".**
   Sem login, é **burlável** (POST direto na API, limpar `localStorage`). É
   métrica de vaidade. Se um dia precisar de contagem confiável, aí entra dedup
   por IP/identidade — outra feature.

7. **NÃO leia o contador no render da página (Server Component estático).**
   A página é estática; ler no build congelaria a contagem. A leitura é
   **sempre no cliente**, via `GET /api/likes/[id]`.

---

## ✅ O que é seguro fazer

- **Renomear, mover ou traduzir o arquivo `.mdx`** à vontade — o `likesId` não
  muda, então os likes seguem o artigo. (Este era o medo original; resolvido por
  desenho, não por disciplina.)
- **Mudar título, descrição, slug, tags, capa** — nada disso afeta o like.
- **Rodar o site sem o Redis configurado** em dev/local — o widget só não
  aparece.

---

## Decisões e trade-offs (registro)

| Decisão                  | Escolha                  | Por quê                                                                  |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------ |
| Onde armazenar           | Upstash Redis (sem TTL)  | Já no projeto, uso baixíssimo, `INCR` atômico, zero infra nova.          |
| Modelo de interação      | Clap (incrementa)        | Simples e anônimo; toggle exigiria identidade por visitante.            |
| Chave do like            | `likesId` no frontmatter | Desacopla do nome do arquivo → renomear não perde likes.                |
| Anti-abuso no MVP        | Nenhum (vanity)          | Começar simples; rate-limit por IP (mesmo Redis) só se virar problema.   |
| Multi-clap por visitante | **A definir**            | Default sugerido: 1 aplauso por visitante. Estilo Medium (N) é opção.    |
| Banco relacional         | Adiado (Postgres)        | Migrar quando o uso crescer ou precisar de analytics/dedup/comentários.  |

---

## Migração futura (Redis → Postgres)

Não é para agora — mas fica documentado o gatilho e o caminho.

**Quando migrar:** uso de comandos do Upstash subindo perto do limite do free
tier, **ou** necessidade de algo que Redis não entrega bem: likes por usuário
identificado, analytics (quem/quando), ou reaproveitar a infra para
comentários.

**Como migrar (baixo risco):**

1. Criar a tabela em Postgres (Neon/Supabase free):
   ```sql
   CREATE TABLE article_likes (
     article_id TEXT PRIMARY KEY,
     count      INTEGER NOT NULL DEFAULT 0,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```
2. Semear com os totais atuais lidos das chaves `likes:*` do Redis.
3. Trocar os helpers `getLikes`/`incrementLikes` para apontar ao Postgres
   (upsert atômico com `ON CONFLICT ... DO UPDATE`). A API route e o componente
   **não mudam** — só a implementação por trás.

---

## Implementação (arquivos planejados)

> Ainda **não** implementado — referência para quando o código entrar.

| Arquivo                                   | Mudança                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `src/lib/redis.ts`                        | Adicionar helpers persistentes `getLikes(id)` (GET) e `incrementLikes(id)` (`redis.incr`, **sem TTL**). |
| `app/api/likes/[id]/route.ts` _(novo)_    | `GET` (lê) e `POST` (incrementa). `dynamic = 'force-dynamic'`.                |
| `src/base/article/Likes/` _(novo)_        | Client component: SWR + POST otimista + flag em `localStorage`.              |
| `src/features/articles/lib/articles.ts`   | Adicionar `likesId` (string obrigatória) ao tipo e à validação do frontmatter. |
| `src/base/article/Layout/index.tsx`       | Renderizar `<Likes likesId={...} />`.                                         |
| `content/**/**.mdx` (2 artigos)           | Adicionar um `likesId` único a cada artigo existente.                         |
| `DEVELOPMENT.md`                          | Documentar as variáveis do Upstash na tabela de env (hoje faltam).           |
