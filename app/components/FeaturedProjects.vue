<script setup lang="ts">
import { profile } from '~/data/profile'
import { projects } from '~/data/projects'

const moreUrl = profile.socials.find(s => s.icon === 'github')?.href

// ── Horizontal carousel: native scroll + snap, arrows, progress bar ──
const carousel = ref<HTMLElement>()
const atStart = ref(true)
const atEnd = ref(false)
const progress = ref(0)
let frame = 0

function measure() {
  frame = 0
  const el = carousel.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft >= max - 4
  progress.value = max > 0 ? el.scrollLeft / max : 1
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(measure)
}

// Move by one card (width of the first card + gap).
function step(direction: 1 | -1) {
  const el = carousel.value
  const card = el?.querySelector('li')
  if (!el || !card) return
  const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: smooth ? 'smooth' : 'auto' })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    step(1)
  }
  else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    step(-1)
  }
}

onMounted(() => {
  measure()
  window.addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <section id="projects" class="section" aria-labelledby="projects-title">
    <div class="container">
      <div class="head">
        <SectionHeading id="projects-title" eyebrow="Selected work" title="Things I've built.">
          {{ projects.length }} projects across AI, full-stack and frontend. Swipe or use the arrows to explore.
        </SectionHeading>

        <div v-reveal class="controls">
          <a v-if="moreUrl" :href="moreUrl" target="_blank" rel="noopener noreferrer" class="btn btn-ghost more">
            More on GitHub
            <AppIcon name="arrowRight" :size="18" />
          </a>
          <button type="button" class="arrow" aria-label="Previous project" :disabled="atStart" @click="step(-1)">
            <AppIcon name="arrowLeft" :size="18" />
          </button>
          <button type="button" class="arrow" aria-label="Next project" :disabled="atEnd" @click="step(1)">
            <AppIcon name="arrowRight" :size="18" />
          </button>
        </div>
      </div>
    </div>

    <ul
      ref="carousel"
      v-reveal
      class="carousel"
      tabindex="0"
      aria-label="Projects — use left and right arrow keys to scroll"
      @scroll.passive="onScroll"
      @keydown="onKeydown"
    >
      <li v-for="(project, i) in projects" :key="project.slug">
        <ProjectCard :project="project" :index="i" />
      </li>
    </ul>

    <div class="container">
      <div class="progress" aria-hidden="true">
        <span :style="{ transform: `scaleX(${Math.max(progress, 0.08)})` }" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0 24px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: clamp(40px, 6vw, 64px);
}

.arrow {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  transition: background-color 0.2s, opacity 0.2s, transform 0.25s var(--ease);
}

.arrow:hover:not(:disabled) {
  background: var(--surface-strong);
  transform: translateY(-2px);
}

.arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Full-bleed track, aligned with the container's content edge */
.carousel {
  --edge: max(var(--gutter), calc((100vw - var(--container)) / 2));

  display: flex;
  gap: 24px;
  margin: 0;
  padding: 8px var(--edge) 28px;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--edge);
  scrollbar-width: none;
  outline: none;
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carousel:focus-visible {
  box-shadow: inset 0 0 0 2px var(--accent-2);
  border-radius: var(--radius);
}

.carousel > li {
  flex: 0 0 min(380px, 84vw);
  scroll-snap-align: start;
}

.progress {
  height: 3px;
  border-radius: 3px;
  background: var(--surface-strong);
  overflow: hidden;
}

.progress span {
  display: block;
  height: 100%;
  background: var(--gradient);
  transform-origin: left;
  transition: transform 0.3s var(--ease);
}

@media (max-width: 640px) {
  .more {
    display: none;
  }

  .carousel {
    gap: 14px;
  }
}
</style>
