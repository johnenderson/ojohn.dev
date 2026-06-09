# Development

Development notes for `ojohn.dev`.

## Requirements

- Node 22, preferably via `nvm`
- Yarn 1.x

```bash
nvm install 22.22.2
nvm use 22.22.2

npm install -g yarn
yarn install
yarn dev
```

The site runs at `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. All variables are
server-only (never exposed to the client). Every integration **degrades
gracefully**: if a variable is missing, the related widget simply doesn't
render — the app keeps working.

| Variable                | Required | Used by                                             |
| ----------------------- | -------- | --------------------------------------------------- |
| `LASTFM_USERNAME`       | optional | `/now` + home activity (defaults to `johnenderson`) |
| `LASTFM_API_KEY`        | yes\*    | Last.fm tracks/artists                              |
| `SPOTIFY_CLIENT_ID`     | yes\*    | Spotify cover art on `/now`                         |
| `SPOTIFY_CLIENT_SECRET` | yes\*    | Spotify cover art on `/now`                         |
| `GITHUB_TOKEN`          | yes\*    | "Pulso de dev" card (GitHub contributions)          |
| `GITHUB_USERNAME`       | optional | GitHub user (defaults to `johnenderson`)            |
| `GITHUB_DEBUG`          | optional | `true` to log GitHub fetch diagnostics              |

\* Required only for that specific widget. A classic `GITHUB_TOKEN` with the
`read:user` scope is enough for public contributions. The GitHub card only ever
reads public activity (`events/public`), so it never exposes private repos.

After changing `.env.local`, restart the dev server (Next reads env at boot).

## Commands

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `yarn dev`            | Start the development server                   |
| `yarn build`          | Build the production site                      |
| `yarn start`          | Start the production server after `yarn build` |
| `yarn lint`           | Run ESLint against `app` and `src`             |
| `yarn typecheck`      | Run TypeScript checks                          |
| `yarn prettier:check` | Check formatting                               |
| `yarn prettier:fix`   | Format supported files                         |

`yarn build` uses `next/font` and may need network access to download Geist
fonts from Google Fonts.

## Project Structure

```text
.
├── app/                # Next.js App Router routes and providers
│   ├── blog/           # Article index and pages generated from content
│   ├── og/             # Dynamic Open Graph image routes (articles + site pages)
│   ├── og-preview/     # Dev-only OG image preview (404 in production)
│   ├── error-test/     # Dev-only route to preview the error boundary
│   ├── rss.xml/        # RSS route handler
│   ├── me/             # About page
│   └── writings/       # Article index
├── content/            # Article content and metadata
├── src/
│   ├── base/           # Shared UI, article, hooks, and graph components
│   ├── features/       # Page/domain-specific features
│   │   ├── articles/   # Article list components and content loaders
│   │   └── home/       # Home-specific components
│   ├── lib/            # Shared helpers and integrations
│   └── types/          # Shared TypeScript types
├── public/             # Static assets
└── styles/             # Global CSS and syntax highlighting styles
```

## Adding Content

Each article lives inside a topic and locale folder:

```text
content/<topic>/
├── en/
│   └── article-slug.mdx
└── pt-BR/
    └── slug-do-artigo.mdx
```

Example article:

```mdx
---
title: 'Article title'
description: 'Short description'
date: '2026-01-05'
tags: ['example', 'nextjs', 'performance']
coverImage:
  src: '/article-slug/cover.jpg'
  width: '640'
  height: '425'
  alt: 'Cover image description'
  authorHref: ''
  authorName: ''
---

Article body.
```

The article body goes below the frontmatter. Headings receive IDs through the MDX
pipeline and are used by the article table of contents.

Article imports are generated from the `content` folder by:

```bash
yarn content:sync
```

`yarn dev`, `yarn build`, `yarn lint`, and `yarn typecheck` run this automatically.
Keeping generated raw MDX imports in the module graph lets Next.js and
Turbopack handle local HMR for article edits without custom polling or
development-only API endpoints.

## MDX Components

The MDX renderer supports:

- GitHub Flavored Markdown tables and lists via `remark-gfm`
- Syntax highlighting via Shiki
- Math with `<InlineMath>` and `<BlockMath>`
- `<Admonition>`, `<Info>`, `<Note>`, `<Tip>`, `<Warning>`, and `<Danger>`
- `<Image>` (article body images — see below)
- `<PostAndDate>`
- `<SideBySideImages>`
- `<SideBySideVideos>`
- `<SmoothRender>` (applied automatically by the article renderer)
- `<TweetEmbed>`
- `<Venn>`

Example:

```mdx
Intro paragraph.

<InlineMath math="E = mc^2" />

<BlockMath math="\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />
```

### Images

Use `<Image>` for images in the article body. Only `src` is required — the
component reads the file from `public/` to derive its dimensions and blur
placeholder automatically, fills the column width, and preserves the original
aspect ratio. `alt` and `caption` are optional; `priority` opts the image into
eager loading (use it only for an above-the-fold image).

```mdx
<Image
  src="/article-slug/photo.jpg"
  alt="Description"
  caption="Optional caption"
/>
```

## Development-only Routes

Some routes exist purely to help debug the site locally. They check
`process.env.NODE_ENV` and return a `404` (via `notFound()`) in any
non-development environment, so they are never reachable in production. They are
also listed under `disallow` in `app/robots.ts` for consistency.

| Route                | Purpose                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/og-preview/<path>` | Renders the dynamic Open Graph image for an article inside an HTML page, with links to open the article and the raw image. |
| `/error-test`        | Throws on render so you can preview the `app/error.tsx` error boundary UI.                                                 |

Notes:

- For `/error-test`, the Next.js dev server shows a full-screen error overlay on
  top of the page. Dismiss it (press `Esc` or close it) to see the styled
  `app/error.tsx` page underneath. The real, overlay-free appearance is what
  ships in production.
- `app/error.tsx` handles route-segment errors (keeps the navbar/layout), while
  `app/global-error.tsx` only triggers if the root layout itself throws and is
  effectively only observable in production.

## Preferences

The navbar includes a preferences panel for:

- theme: system, light, or dark
- content text size: `14px`, `16px`, `17px`, `18px`, or `20px`

The selected text size is stored in `localStorage` as `prose_font_size` and
applied through the `--prose-font-size` CSS variable.
