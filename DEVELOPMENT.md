# Development

Development notes for `johnenderson.dev`.

## Requirements

- Node 22, preferably via `nvm`
- Yarn 1.x

```bash
nvm install 22.15.0
nvm use 22.15.0

npm install -g yarn
yarn install
yarn dev
```

The site runs at `http://localhost:3000`.

## Commands

| Command | Description |
|---|---|
| `yarn dev` | Start the development server |
| `yarn build` | Build the production site |
| `yarn start` | Start the production server after `yarn build` |
| `yarn lint` | Run ESLint against `app`, `Base`, `Home`, and `src` |
| `yarn typecheck` | Run TypeScript checks |
| `yarn prettier:check` | Check formatting |
| `yarn prettier:fix` | Format supported files |
| `yarn cypress` | Open Cypress |

`yarn build` uses `next/font` and may need network access to download Geist
fonts from Google Fonts.

## Project Structure

```text
.
├── app/                # Next.js App Router routes and providers
│   ├── [slug]/         # Article pages generated from content
│   ├── rss.xml/        # RSS route handler
│   ├── sobre/          # About page
│   └── writings/       # Article index
├── Base/               # Shared UI and article components
│   ├── Article/        # Article layout, metadata, ToC, cover, footer
│   ├── components/     # Navbar, footer, MDX components, command UI
│   └── LinksGraph/     # Link graph utilities/components
├── Home/               # Home and writings-list components
├── content/            # Article content and metadata
├── src/lib/            # Content loading, route generation, metadata helpers
├── src/types/          # Shared TypeScript types
├── public/             # Static assets
└── styles/             # Global CSS and syntax highlighting styles
```

## Adding Content

Each article currently lives in:

```text
content/<slug>/en/
├── index.mdx
└── metadata.json
```

Example metadata:

```json
{
  "title": "Article title",
  "description": "Short description",
  "date": "2026-01-05",
  "tags": [
    {
      "href": "/tags/example",
      "name": "example"
    }
  ],
  "coverImage": {
    "src": "/article-slug/cover.jpg",
    "width": "640",
    "height": "425",
    "alt": "Cover image description",
    "authorHref": "",
    "authorName": ""
  }
}
```

The article body goes in `index.mdx`. Headings receive IDs through the MDX
pipeline and are used by the article table of contents.

## MDX Components

The MDX renderer supports:

- GitHub Flavored Markdown tables and lists via `remark-gfm`
- Syntax highlighting via `rehype-highlight`
- Math with `<InlineMath>` and `<BlockMath>`
- `<PostAndDate>`
- `<SideBySideImages>`
- `<SideBySideVideos>`
- `<SmoothRender>`
- `<TweetEmbed>`
- `<Venn>`

Example:

```mdx
<SmoothRender>

Intro paragraph.

<InlineMath math="E = mc^2" />

<BlockMath math="\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />

</SmoothRender>
```

## Preferences

The navbar includes a preferences panel for:

- theme: system, light, or dark
- content text size: `14px`, `16px`, `17px`, `18px`, or `20px`

The selected text size is stored in `localStorage` as `prose_font_size` and
applied through the `--prose-font-size` CSS variable.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` / `Cmd+K` | Open command palette |
| `g` `h` | Go to Home |
| `g` `w` | Go to Articles |
| `f` `g` | Open GitHub |
| `f` `t` | Open Twitter |
| `f` `l` | Open LinkedIn |
