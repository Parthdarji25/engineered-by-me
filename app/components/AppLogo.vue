<script setup lang="ts">
import { profile } from '~/data/profile'

/**
 * Personal logo: "PD" monogram + name wordmark.
 *
 * variant
 *  - 'auto' (default): responsive —
 *      desktop ≥ 1100px  → mark + name + tagline
 *      381–1099px        → mark + name
 *      ≤ 380px           → mark only
 *  - 'full' | 'compact' | 'mark': force one version everywhere.
 */
const props = withDefaults(defineProps<{
  variant?: 'auto' | 'full' | 'compact' | 'mark'
  size?: number
}>(), {
  variant: 'auto',
  size: 40,
})

// Unique gradient id per logo instance (the header and footer both render one).
const gradientId = `logo-grad-${useId()}`

const initials = profile.name
  .split(/\s+/)
  .map(part => part.charAt(0))
  .join('')
  .slice(0, 2)
  .toUpperCase()

const [firstName, ...rest] = profile.name.split(' ')
const lastName = rest.join(' ')
</script>

<template>
  <span class="logo" :class="`logo--${props.variant}`">
    <svg
      class="mark"
      :width="size"
      :height="size"
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" class="stop-a" />
          <stop offset="1" class="stop-b" />
        </linearGradient>
      </defs>
      <!-- Tile -->
      <rect x="1" y="1" width="38" height="38" rx="11" :fill="`url(#${gradientId})`" />
      <!-- Inner hairline for depth -->
      <rect x="1.75" y="1.75" width="36.5" height="36.5" rx="10.25" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="1.5" />
      <!-- Initials -->
      <text
        x="19.5"
        y="26.2"
        text-anchor="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="16.5"
        font-weight="800"
        letter-spacing="-0.9"
        fill="#fff"
      >{{ initials }}</text>
      <!-- "Node" dot: a nod to networks / AI -->
      <circle class="node" cx="31.5" cy="8.5" r="2.4" fill="#fff" />
    </svg>

    <span class="wordmark">
      <span class="name">
        <span class="first">{{ firstName }}</span><span class="last">{{ lastName }}</span><span class="dot" aria-hidden="true">.</span>
      </span>
      <span class="tagline">Software · AI Engineer</span>
    </span>
  </span>
</template>

<style scoped>
.logo {
  --logo-a: #a78bfa;
  --logo-b: #22d3ee;

  display: inline-flex;
  align-items: center;
  gap: 12px;
  line-height: 1;
}

:root[data-theme='light'] .logo {
  --logo-a: #6d28d9;
  --logo-b: #0891b2;
}

.stop-a {
  stop-color: var(--logo-a);
}

.stop-b {
  stop-color: var(--logo-b);
}

.mark {
  flex-shrink: 0;
  filter: drop-shadow(0 6px 14px color-mix(in srgb, var(--logo-a) 45%, transparent));
  transition: transform 0.45s var(--ease);
}

.node {
  transform-box: fill-box;
  transform-origin: center;
  animation: node-pulse 2.8s ease-in-out infinite;
}

.wordmark {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.name {
  font-size: 17px;
  letter-spacing: -0.02em;
  white-space: nowrap;
  color: var(--text);
}

.first {
  font-weight: 800;
}

.last {
  margin-left: 0.28em;
  font-weight: 500;
  color: var(--text-muted);
}

.dot {
  font-weight: 800;
  background: linear-gradient(120deg, var(--logo-a), var(--logo-b));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
  white-space: nowrap;
}

/* Hover (the logo sits inside a link) */
a:hover > .logo .mark,
a:focus-visible > .logo .mark {
  transform: rotate(-8deg) scale(1.06);
}

a:hover > .logo .last {
  color: var(--text);
}

@keyframes node-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.55;
    transform: scale(0.7);
  }
}

/* ── Forced variants ── */
.logo--mark .wordmark {
  display: none;
}

.logo--compact .tagline {
  display: none;
}

/* ── Responsive (variant="auto") ── */
.logo--auto .tagline {
  display: none;
}

@media (max-width: 380px) {
  .logo--auto .wordmark {
    display: none;
  }
}

@media (min-width: 1100px) {
  .logo--auto .tagline {
    display: block;
  }
}
</style>
