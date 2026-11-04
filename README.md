# Parth Darji — Portfolio

Personal portfolio homepage built with **Nuxt 4 (Vue 3)**, **TypeScript** and **Three.js**.
Responsive, light/dark themes, scroll animations, an interactive 3D hero, and fully static output.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run generate` | Static build → `.output/public` (deploy this folder) |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Type-check all `.ts` and `.vue` files |

## Edit your content

- **`app/data/profile.ts`** — name, roles, email, social links, expertise, tech stack and stats.
- **`app/data/projects.ts`** — the project cards *and* their case-study pages (`/projects/<slug>`):
  problem/solution, features, architecture layers, request flows, decisions, challenges, results,
  and the scripted answers of the "Project Guide" chat.

Lines marked `TODO` are sample content to replace.

## Deploy

Hosted on **Vercel** — it detects Nuxt automatically and redeploys on every push to `main`.

## Structure

```
app/
  app.vue                 root component
  error.vue               404 / error page
  layouts/default.vue     header + main + footer shell
  pages/index.vue         the homepage (SEO meta + sections)
  pages/projects/[slug].vue  case-study page for each project (dynamic route)
  components/             one component per section, plus UI pieces
    HeroScene.client.vue  Three.js 3D scene (browser only, lazy loaded)
    ArchitectureExplorer.vue / ArchitectureDiagram.vue  interactive architecture + playable flow
    ProjectAssistant.vue  simulated "agent" chat (scripted answers, no AI)
  composables/            reusable logic: theme, clipboard, reduced motion, smooth scroll,
                          useProjectAssistant (keyword matching + streamed scripted answers)
  plugins/directives.ts   v-reveal (scroll animation), v-tilt (3D card tilt), v-magnetic (cursor pull)
  plugins/lenis.client.ts smooth scrolling (Lenis)
  router.options.ts       scroll behaviour between pages and #sections
  data/profile.ts         site content
  data/projects.ts        project case studies
  utils/icons.ts          inline SVG icon set
  assets/css/main.css     design tokens and global styles
public/                   favicon, robots.txt
```
