# ojohn.dev

Personal website with a home page, long-form articles, RSS feed, theme
preferences, and reading controls.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- MDX via `next-mdx-remote`

## Routes

| Route          | Description                                     |
| -------------- | ----------------------------------------------- |
| `/`            | Home page                                       |
| `/blog`        | Article index                                   |
| `/blog/[slug]` | Article page generated from `content/<slug>/en` |
| `/me`          | About page                                      |
| `/rss.xml`     | RSS feed                                        |

## Development

Development setup, commands, project structure, and content authoring notes live
in [DEVELOPMENT.md](./DEVELOPMENT.md).

## Licenses

- Source code: [MIT](./LICENSE)
- Images, text, and assets: [BY-NC-SA 4.0](./LICENSE-content)
