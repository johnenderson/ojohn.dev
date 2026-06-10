---
name: article-visuals
description: Create cohesive cover images and per-article icons for the ojohn.dev blog — vector SVG in the site palette, exported to WebP and wired into MDX frontmatter. Use when adding/illustrating a blog article (a new content/<topic>/<locale>/*.mdx), when the user asks for an article cover, thumbnail, or icon, or when they mention making a visual/illustration for a post.
---

# Article Visuals (ojohn.dev)

Produce **cover images** and **per-article icons** that feel native to the site:
flat, dark, minimalist, vector — never generic AI raster art. Everything is
hand-built SVG using the site palette, exported to WebP with `sharp`, and wired
into the article frontmatter.

## When to apply

- A new article is added under `content/<topic>/<locale>/<name>.mdx` and needs a cover and/or icon.
- The user asks for an article cover, thumbnail, hero, or icon.
- The user wants the visual to "match the site" / be authentic rather than a stock/AI image.

There is no AI raster image generator available. Build vector SVG and convert
it — for technical/infra topics this looks more professional anyway.

## Design system (use these exact values)

Standalone assets, so use explicit hex (do NOT depend on CSS variables — they
won't exist outside the app).

| Token           | Value                                          | Use                                       |
| --------------- | ---------------------------------------------- | ----------------------------------------- |
| Background dark | `#0e0c14` (deep `#0b0a10`)                     | cover canvas                              |
| Surface         | gradient `#211d2b` → `#16131d`; flat `#1a1722` | cards, icon body, node boxes              |
| Teal primary    | `#5bd3c7`; gradient `#6fe0d4` → `#3fb9ac`      | primary glyphs, strokes, flow             |
| Orange accent   | `#f0a66d`                                      | one accent only (a highlight/alert/pulse) |
| Foreground      | `#fffaf5`                                      | titles                                    |
| Muted text      | `#b4adb7`; dimmer `#7d7280`                    | labels, captions                          |
| Border          | `#3a3442`; subtle `rgba(123,108,126,0.22)`     | strokes, dividers                         |

Rules of thumb (kept minimal, like the site):

- **≤2 color ramps** (teal + neutrals) plus orange as a single accent.
- Flat surfaces; at most one subtle radial bg glow and restrained gradients. No noise/mesh.
- Generous whitespace; tell one clear idea, not a busy diagram.
- Every SVG: `role="img"` with `<title>`/`<desc>`; use `aria-hidden` decorative parts.
- Font stack for any text: `'Geist','Inter',system-ui,sans-serif`.

## Cover image (1200×630, the OG/cover ratio)

Tell the article's story left-to-right or as a single hero concept. Do **not**
put the article title in the cover — it already renders right above the image
on the page (redundant). Let the illustration carry it.

Pattern that works (from the Karpenter cover): `source → process → result`
with a labelled hierarchy along the bottom. Centre the composition; ~80–130px
top/bottom padding.

Skeleton:

```svg
<svg viewBox="0 0 1200 630" role="img" aria-labelledby="t d"
     font-family="'Geist','Inter',system-ui,sans-serif">
  <title id="t">Capa do artigo sobre …</title>
  <desc id="d">Descrição do que a ilustração mostra.</desc>
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#16202a"/>
      <stop offset="55%" stop-color="#0e0c14"/>
      <stop offset="100%" stop-color="#0b0a10"/>
    </radialGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6fe0d4"/><stop offset="100%" stop-color="#3fb9ac"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- muted section labels (#9aa0a8), teal flow arrows, dark node/card shapes -->
  <!-- one orange accent for the "problem"/highlight element -->
</svg>
```

## Per-article icon (128×128 → square "app icon")

A rounded-square dark tile + a single teal topic glyph. Keep it readable at
40–48px. The header and list card render it **standalone** (no badge), so the
icon must look complete on its own.

```svg
<svg viewBox="0 0 128 128" role="img" aria-label="Ícone do artigo sobre …">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#211d2b"/><stop offset="100%" stop-color="#141019"/>
    </linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6fe0d4"/><stop offset="100%" stop-color="#3fb9ac"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="124" height="124" rx="28" fill="url(#bg)" stroke="#3a3442" stroke-width="2"/>
  <!-- centred glyph: stroke 5–5.5, stroke-linecap/linejoin round, teal -->
  <!-- one small orange accent allowed (e.g. a pulse peak) -->
</svg>
```

Glyph guidance: represent the _topic_, not the brand logo (more authentic and
keeps the set cohesive). Examples used: Karpenter → hexagon + gear; Datadog DBM
→ database cylinder + orange monitoring pulse. Match stroke weight across the
whole set so icons look like siblings.

## Build workflow

1. Write the SVG to `public/<topic>/cover.svg` and/or `public/<topic>/icon.svg`
   (mirror the article's topic folder; keep the `.svg` as the editable source).
2. Convert to WebP with `sharp` (already a dependency). Run via WSL + node 22:

```bash
node --input-type=module -e "
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
// cover
await sharp(readFileSync('public/<topic>/cover.svg'), { density: 200 })
  .resize(1200, 630).webp({ quality: 90 }).toFile('public/<topic>/cover.webp');
// icon (higher density so small strokes stay crisp)
await sharp(readFileSync('public/<topic>/icon.svg'), { density: 300 })
  .resize(192, 192).webp({ quality: 92 }).toFile('public/<topic>/icon.webp');
console.log('done');
"
```

3. Preview before wiring: composite onto a flat dark canvas via
   `sharp({ create: { width, height, channels: 4, background: '#0e0c14' } })`
   (avoid inline-SVG canvases — shell escaping corrupts them) and open the PNG.

## Wire into frontmatter

`icon` and `coverImage` are parsed by `src/features/articles/lib/articles.ts`.
The icon may be an emoji **or** a path starting with `/` (rendered via
`ArticleIcon` → `next/image`). `coverImage` is a nested block (2-space indent):

```yaml
---
title: '…'
description: '…'
date: 'YYYY-MM-DD'
icon: '/<topic>/icon.webp'
tags: ['…']
coverImage:
  src: '/<topic>/cover.webp'
  width: 1200
  height: 630
  alt: 'Descrição objetiva da ilustração'
---
```

## Verify

- `yarn build` prerenders the article (SSG) without errors.
- In a browser (Claude Preview): the cover renders at the top via `CoverImage`,
  the icon shows in the `/blog` card (48px) and standalone in the article header,
  and there are no console errors. Free port 3000 first (`fuser -k 3000/tcp`).
- Keep both `.svg` (source) and `.webp` (used) committed; don't leave preview PNGs.

## Checklist

- [ ] Cover 1200×630, no title text, ≤2 ramps + orange accent, `role/title/desc`
- [ ] Icon 128×128 rounded tile, single topic glyph, readable at 48px, consistent stroke weight with the set
- [ ] WebP exported; SVG source kept; files under `public/<topic>/`
- [ ] Frontmatter `icon` and/or `coverImage` wired with descriptive `alt`
- [ ] Verified in a real browser, no console errors
