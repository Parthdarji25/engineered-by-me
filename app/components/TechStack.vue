<script setup lang="ts">
import { techStack } from '~/data/profile'

const active = ref(0)
const cards = ref<HTMLElement[]>([])
const { scrollTo } = useSmoothScroll()

// Scrollytelling: the card crossing the middle of the screen becomes active,
// which lights up its pathway in the neural network.
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.value = Number((entry.target as HTMLElement).dataset.index)
    }
  }, { rootMargin: '-45% 0px -45% 0px' })
  cards.value.forEach(card => observer!.observe(card))
})

onBeforeUnmount(() => observer?.disconnect())

function select(index: number) {
  active.value = index
  const card = cards.value[index]
  if (card) scrollTo(card)
}

// Progress of the mobile "circuit" rail (0 → 1).
const railFill = computed(() => (active.value + 1) / techStack.length)
</script>

<template>
  <section id="stack" class="section" aria-labelledby="stack-title">
    <div class="container">
      <SectionHeading id="stack-title" eyebrow="Tech stack" title="Tools I reach for.">
        Grouped by where they sit in a product. Scroll to walk through each layer.
      </SectionHeading>

      <div class="layout">
        <!-- Neural network (sticky on desktop) -->
        <div class="viz">
          <div v-reveal class="viz-card card glow-border is-always net-wrap">
            <p class="viz-head">
              <span class="dot" aria-hidden="true" />
              <code>stack.forward(</code><Transition name="swap" mode="out-in">
                <code :key="active" class="viz-active">"{{ techStack[active]?.name }}"</code>
              </Transition><code>)</code>
            </p>
            <SkillNetwork :labels="techStack.map(g => g.name)" :active="active" @select="select" />
          </div>
        </div>

        <!-- Skill groups -->
        <ol class="groups" :style="{ '--fill': railFill }">
          <li
            v-for="(group, i) in techStack"
            :key="group.name"
            ref="cards"
            v-reveal
            :data-index="i"
            class="group card"
            :class="{ 'is-active': i === active }"
          >
            <span class="rail-node" aria-hidden="true" />

            <header class="group-head">
              <span class="group-icon" aria-hidden="true">
                <AppIcon :name="group.icon" :size="22" />
              </span>
              <div>
                <h3>{{ group.name }}</h3>
                <p class="group-summary">
                  {{ group.summary }}
                </p>
              </div>
              <span class="group-num" aria-hidden="true">0{{ i + 1 }}</span>
            </header>

            <p class="label">
              Core
            </p>
            <ul class="core" :aria-label="`${group.name} core skills`">
              <li v-for="(tool, t) in group.core" :key="tool" :style="{ '--t': t }">
                {{ tool }}
              </li>
            </ul>

            <p class="label">
              Also worked with
            </p>
            <p class="also">
              {{ group.also.join(' · ') }}
            </p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: 32px;
}

/* ── Network panel ── */
.viz-card {
  padding: 20px 20px 12px;
}

.viz-head {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.viz-head code {
  font-family: var(--font-mono);
}

.viz-active {
  color: var(--accent-2);
}

.dot {
  width: 8px;
  height: 8px;
  margin-right: 10px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

/* ── Skill groups ── */
.groups {
  position: relative;
  display: grid;
  gap: 20px;
  margin: 0;
  padding: 0 0 0 28px;
  list-style: none;
}

/* Mobile "circuit" rail that fills as you scroll through the groups */
.groups::before,
.groups::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 2px;
  background: var(--border);
}

.groups::after {
  background: linear-gradient(to bottom, var(--accent), var(--accent-2));
  box-shadow: 0 0 10px var(--accent-2);
  transform-origin: top;
  transform: scaleY(var(--fill));
  transition: transform 0.6s var(--ease);
}

.rail-node {
  position: absolute;
  top: 34px;
  left: -28px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--bg);
  transition: all 0.4s var(--ease);
}

.group.is-active .rail-node {
  border-color: var(--accent-2);
  background: var(--accent-2);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-2) 25%, transparent);
}

.group {
  padding: 24px;
  transition:
    border-color 0.4s var(--ease),
    background-color 0.4s var(--ease),
    box-shadow 0.4s var(--ease),
    opacity 0.9s var(--ease),
    transform 0.9s var(--ease),
    filter 0.9s var(--ease);
}

.group.is-active {
  border-color: color-mix(in srgb, var(--accent-2) 50%, var(--border));
  box-shadow: 0 20px 50px -30px var(--accent-2);
}

.group-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: start;
}

.group-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: var(--surface-strong);
  color: var(--text-muted);
  transition: background 0.4s, color 0.4s, box-shadow 0.4s;
}

.group.is-active .group-icon {
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 10px 26px -10px var(--accent-2);
}

h3 {
  font-size: 20px;
  font-weight: 700;
}

.group-summary {
  margin-top: 4px;
  font-size: 14.5px;
  color: var(--text-muted);
}

.group-num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-dim);
}

.label {
  margin: 20px 0 10px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.core {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.core li {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 15px;
  font-weight: 600;
  transition:
    border-color 0.4s var(--ease),
    background-color 0.4s var(--ease),
    transform 0.4s var(--ease);
  transition-delay: calc(var(--t) * 50ms);
}

.group.is-active .core li {
  border-color: color-mix(in srgb, var(--accent-2) 45%, transparent);
  background: color-mix(in srgb, var(--accent-2) 10%, var(--surface));
  transform: translateY(-2px);
}

.also {
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--text-muted);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.2s, transform 0.2s var(--ease);
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Desktop: sticky network beside the groups, inactive groups recede ── */
@media (min-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 48px;
    align-items: start;
  }

  .viz {
    position: sticky;
    top: calc(var(--header-h) + 32px);
  }

  .groups {
    gap: 24px;
    padding-left: 0;
  }

  .groups::before,
  .groups::after,
  .rail-node {
    display: none;
  }

  .group[data-visible]:not(.is-active) {
    opacity: 0.5;
  }
}
</style>
