<script setup lang="ts">
import { experience } from '~/data/profile'

// The pipeline line fills as you scroll through the section.
const pipeline = ref<HTMLElement>()
const fill = ref(0)
let frame = 0

function measure() {
  frame = 0
  const el = pipeline.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const progress = (window.innerHeight * 0.6 - rect.top) / rect.height
  fill.value = Math.min(Math.max(progress, 0), 1)
}
const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})

const stageId = (i: number) => `stage_0${experience.roles.length - i}`
</script>

<template>
  <section id="experience" class="section" aria-labelledby="experience-title">
    <div class="container">
      <SectionHeading id="experience-title" eyebrow="Experience" title="Where I've been shipping.">
        Production Vue and Nuxt work at {{ experience.company }}, from trainee to software engineer.
      </SectionHeading>

      <div ref="pipeline" class="pipeline" :style="{ '--fill': fill }">
        <div class="line" aria-hidden="true">
          <span class="line-fill"><span class="packet" /></span>
        </div>

        <!-- Source: the company -->
        <header v-reveal class="company card glow-border is-always">
          <span class="node node-source" aria-hidden="true" />
          <span class="co-logo" aria-hidden="true">CeX</span>
          <div class="co-text">
            <h3>{{ experience.company }}</h3>
            <p class="meta">
              {{ experience.employment }} · {{ experience.location }} · Since {{ experience.since }}
            </p>
          </div>
          <code class="run" aria-hidden="true">career.pipeline()</code>
        </header>

        <template v-for="(role, i) in experience.roles" :key="role.title">
          <!-- Stage: a role -->
          <article v-reveal class="stage">
            <span class="node" :class="role.current ? 'is-running' : 'is-done'" aria-hidden="true">
              <AppIcon v-if="!role.current" name="check" :size="11" />
            </span>

            <div class="stage-head">
              <code class="stage-id" aria-hidden="true">{{ stageId(i) }}</code>
              <h3>{{ role.title }}</h3>
              <span class="status" :class="role.current ? 'is-running' : 'is-done'">
                {{ role.current ? 'Running' : 'Completed' }}
              </span>
            </div>
            <p class="period">
              {{ role.period }}<template v-if="role.duration">
                · {{ role.duration }}
              </template>
            </p>

            <ol v-if="role.projects.length" class="steps">
              <li
                v-for="(project, p) in role.projects"
                :key="project.name"
                v-reveal="p * 90"
                class="step card glow-border"
              >
                <code class="step-id" aria-hidden="true">step {{ p + 1 }} / {{ role.projects.length }}</code>
                <h4>{{ project.name }}</h4>
                <ul class="points">
                  <li v-for="point in project.points" :key="point">
                    {{ point }}
                  </li>
                </ul>
                <ul class="tags" :aria-label="`${project.name} tech`">
                  <li v-for="tag in project.tags" :key="tag" class="chip">
                    {{ tag }}
                  </li>
                </ul>
              </li>
            </ol>
          </article>

          <!-- Milestone between roles -->
          <p v-if="i === 0 && experience.roles.length > 1" v-reveal class="milestone">
            <span class="node node-milestone" aria-hidden="true">
              <AppIcon name="arrowUp" :size="11" />
            </span>
            {{ experience.promotion }}
          </p>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pipeline {
  --rail: 15px; /* x of the line's centre */

  position: relative;
  display: grid;
  gap: 28px;
  padding-left: 48px;
}

/* ── The line, its scroll fill and a travelling signal ── */
.line {
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: calc(var(--rail) - 1px);
  width: 2px;
  border-radius: 2px;
  background: var(--border);
}

.line-fill {
  position: absolute;
  inset: 0 0 auto;
  height: calc(var(--fill) * 100%);
  border-radius: inherit;
  background: linear-gradient(to bottom, var(--accent), var(--accent-2));
  box-shadow: 0 0 12px var(--accent-2);
  transition: height 0.2s linear;
}

.packet {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 12px 3px var(--accent-2);
  animation: travel 2.4s linear infinite;
}

/* ── Nodes on the line ── */
.node {
  position: absolute;
  top: 26px;
  left: calc(var(--rail) - 48px - 9px);
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--bg);
  color: #fff;
  z-index: 1;
}

.node-source {
  left: calc(var(--rail) - 48px - 11px);
  width: 22px;
  height: 22px;
  border: 0;
  background: var(--gradient);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 20%, transparent);
}

.node.is-running {
  border-color: var(--success);
  background: var(--success);
  box-shadow: 0 0 0 0 var(--success);
  animation: ping 2s ease-out infinite;
}

.node.is-done {
  border-color: transparent;
  background: var(--accent-2);
}

/* ── Company ── */
.company {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
}

.co-logo {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #d71920;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.02em;
}

.co-text {
  flex: 1;
  min-width: 200px;
}

.company h3 {
  font-size: 20px;
}

.meta {
  margin-top: 2px;
  font-size: 14.5px;
  color: var(--text-muted);
}

.run {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--accent-2);
}

/* ── Stages (roles) ── */
.stage {
  position: relative;
}

.stage-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  padding-top: 20px;
}

.stage-id {
  flex-basis: 100%;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}

.stage h3 {
  font-size: clamp(20px, 2.4vw, 24px);
}

.status {
  padding: 2px 10px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
}

.status.is-running {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 14%, transparent);
}

.status.is-done {
  color: var(--accent-2);
  background: color-mix(in srgb, var(--accent-2) 14%, transparent);
}

.period {
  margin-top: 4px;
  font-size: 14.5px;
  color: var(--text-muted);
}

/* ── Steps (projects) ── */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 16px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  transition: border-color 0.3s, transform 0.4s var(--ease), opacity 0.9s var(--ease), filter 0.9s var(--ease);
}

.step:hover {
  border-color: var(--border-strong);
  transform: translateY(-4px);
}

.step-id {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--accent-2);
}

.step h4 {
  font-size: 17px;
  font-weight: 700;
}

.points {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.points li {
  position: relative;
  padding-left: 16px;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--text-muted);
}

.points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-2);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: auto 0 0;
  padding: 6px 0 0;
  list-style: none;
}

/* ── Milestone ── */
.milestone {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-self: start;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px dashed color-mix(in srgb, var(--accent) 50%, transparent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  font-size: 13.5px;
  font-weight: 600;
}

.node-milestone {
  top: 50%;
  margin-top: -9px;
  border-color: transparent;
  background: var(--accent);
}

@keyframes travel {
  from {
    top: 0;
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  to {
    top: 100%;
    opacity: 0;
  }
}

@keyframes ping {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 60%, transparent);
  }

  100% {
    box-shadow: 0 0 0 10px transparent;
  }
}

@media (max-width: 640px) {
  .pipeline {
    padding-left: 40px;
  }

  .node {
    left: calc(var(--rail) - 40px - 9px);
  }

  .node-source {
    left: calc(var(--rail) - 40px - 11px);
  }

  .run {
    display: none;
  }
}
</style>
