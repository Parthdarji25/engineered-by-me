<script setup lang="ts">
import type { Project } from '~/data/projects'

const props = defineProps<{
  project: Project
  index: number
}>()

// Cover art is generated from the project's palette — no image files needed.
const coverStyle = computed(() => ({
  '--c1': props.project.palette[0],
  '--c2': props.project.palette[1],
}))
</script>

<template>
  <article v-tilt="4" class="card project glow-border">
    <div class="cover" :style="coverStyle" aria-hidden="true">
      <span class="blob b1" />
      <span class="blob b2" />
      <span class="cover-grid" />
      <span class="cover-num">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>

    <div class="body">
      <p class="category">
        {{ project.category }}
      </p>
      <h3>
        <!-- Stretched link: its ::after covers the whole card, so the card is clickable -->
        <NuxtLink :to="`/projects/${project.slug}`" class="stretched">
          {{ project.title }}
        </NuxtLink>
      </h3>
      <p class="summary">
        {{ project.summary }}
      </p>

      <ul class="tags" :aria-label="`${project.title} tech`">
        <li v-for="tag in project.tags" :key="tag" class="chip">
          {{ tag }}
        </li>
      </ul>

      <div class="links">
        <span class="case-study" aria-hidden="true">
          Case study <AppIcon name="arrowRight" :size="16" />
        </span>
        <!-- Placeholder links ("#") are hidden until a real URL is added. -->
        <a
          v-if="isRealUrl(project.repoUrl)"
          :href="project.repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
        >
          <AppIcon name="github" :size="17" /> Code
          <span class="sr-only">for {{ project.title }}</span>
        </a>
        <a
          v-if="isRealUrl(project.liveUrl)"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
        >
          <AppIcon name="external" :size="17" /> Live demo
          <span class="sr-only">of {{ project.title }}</span>
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  transition: transform 0.5s var(--ease), border-color 0.3s, box-shadow 0.3s;
}

.project.is-tilting {
  transition: transform 0.08s linear, border-color 0.3s, box-shadow 0.3s;
}

.project:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow);
}

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: color-mix(in srgb, var(--c1) 14%, var(--bg-elevated));
  border-bottom: 1px solid var(--border);
}

.blob {
  position: absolute;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(34px);
  opacity: 0.75;
  transition: transform 0.8s var(--ease);
}

.b1 {
  top: -30%;
  left: -10%;
  background: var(--c1);
}

.b2 {
  bottom: -40%;
  right: -15%;
  background: var(--c2);
}

.project:hover .b1 {
  transform: translate(12%, 10%) scale(1.1);
}

.project:hover .b2 {
  transform: translate(-10%, -8%) scale(1.05);
}

.cover-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px) 0 0 / 28px 28px,
    linear-gradient(90deg, rgb(255 255 255 / 0.12) 1px, transparent 1px) 0 0 / 28px 28px;
  mask-image: radial-gradient(circle at center, #000, transparent 75%);
}

.cover-num {
  position: absolute;
  right: 20px;
  bottom: 12px;
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: rgb(255 255 255 / 0.85);
  mix-blend-mode: overlay;
}

.body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  padding: 24px;
}

.category {
  font-family: var(--font-mono);
  font-size: 12.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-2);
}

h3 {
  font-size: 20px;
  font-weight: 650;
}

.summary {
  color: var(--text-muted);
  font-size: 15px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

.stretched::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.stretched:focus-visible {
  outline: none;
}

.project:has(.stretched:focus-visible) {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}

.project {
  cursor: pointer;
}

.links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  margin-top: auto;
  padding-top: 12px;
}

.case-study {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--accent-2);
}

.case-study svg {
  transition: transform 0.25s var(--ease);
}

.project:hover .case-study svg {
  transform: translateX(4px);
}

/* Secondary links sit above the stretched link so they stay clickable. */
.link {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text-muted);
  transition: color 0.2s;
}

.link:hover {
  color: var(--text);
}
</style>
