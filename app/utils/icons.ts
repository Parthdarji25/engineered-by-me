// Inline SVG icon set (24x24, stroke based). Rendered by <AppIcon name="..." />.
// Keeping icons as data avoids an icon library and keeps the bundle small.

export interface IconShape {
  tag: 'path' | 'rect' | 'circle'
  attrs: Record<string, string | number>
}

const p = (d: string): IconShape => ({ tag: 'path', attrs: { d } })

export const icons = {
  github: [
    p('M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4'),
    p('M9 18c-4.51 2-5-2-7-2'),
  ],
  linkedin: [
    p('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z'),
    { tag: 'rect', attrs: { x: 2, y: 9, width: 4, height: 12 } },
    { tag: 'circle', attrs: { cx: 4, cy: 4, r: 2 } },
  ],
  // X (Twitter) logo — a filled shape, unlike the stroke icons.
  x: [{ tag: 'path', attrs: { 'd': 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', 'fill': 'currentColor', 'stroke': 'none' } }],
  mail: [
    { tag: 'rect', attrs: { x: 2, y: 4, width: 20, height: 16, rx: 2 } },
    p('m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'),
  ],
  code: [p('m16 18 6-6-6-6'), p('m8 6-6 6 6 6')],
  terminal: [p('m4 17 6-6-6-6'), p('M12 19h8')],
  server: [
    { tag: 'rect', attrs: { x: 2, y: 2, width: 20, height: 8, rx: 2 } },
    { tag: 'rect', attrs: { x: 2, y: 14, width: 20, height: 8, rx: 2 } },
    p('M6 6h.01'),
    p('M6 18h.01'),
  ],
  sparkles: [
    p('M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z'),
    p('M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'),
  ],
  menu: [p('M4 6h16'), p('M4 12h16'), p('M4 18h16')],
  close: [p('M18 6 6 18'), p('m6 6 12 12')],
  sun: [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 4 } },
    p('M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'),
  ],
  moon: [p('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z')],
  arrowRight: [p('M5 12h14'), p('m12 5 7 7-7 7')],
  arrowDown: [p('M12 5v14'), p('m19 12-7 7-7-7')],
  arrowUp: [p('M12 19V5'), p('m5 12 7-7 7 7')],
  external: [p('M7 7h10v10'), p('M7 17 17 7')],
  copy: [
    { tag: 'rect', attrs: { x: 8, y: 8, width: 14, height: 14, rx: 2 } },
    p('M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'),
  ],
  check: [p('M20 6 9 17l-5-5')],
  arrowLeft: [p('M19 12H5'), p('m12 19-7-7 7-7')],
  play: [p('M7 4.5v15l12-7.5z')],
  pause: [
    { tag: 'rect', attrs: { x: 6, y: 4, width: 4, height: 16, rx: 1 } },
    { tag: 'rect', attrs: { x: 14, y: 4, width: 4, height: 16, rx: 1 } },
  ],
  cursor: [p('M4 4l7 17 2.5-7.5L21 11z')],
  send: [p('M22 2 11 13'), p('M22 2l-7 20-4-9-9-4z')],
  bot: [
    { tag: 'rect', attrs: { x: 3, y: 8, width: 18, height: 12, rx: 3 } },
    p('M12 8V5'),
    { tag: 'circle', attrs: { cx: 12, cy: 4, r: 1 } },
    p('M9 14h.01M15 14h.01'),
  ],
} satisfies Record<string, IconShape[]>

export type IconName = keyof typeof icons
