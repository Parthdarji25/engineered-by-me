<script setup lang="ts">
import { findProject, projects } from '~/data/projects'
import { profile } from '~/data/profile'

definePageMeta({
  // Unknown slugs become a 404 before the page renders.
  validate: route => projects.some(p => p.slug === route.params.slug),
  // Re-create the page when moving from one project to the next.
  key: route => route.path,
})

const route = useRoute()
const project = findProject(String(route.params.slug))!

const index = projects.indexOf(project)
const nextProject = projects[(index + 1) % projects.length]!

const coverStyle = {
  '--c1': project.palette[0],
  '--c2': project.palette[1],
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'results', label: 'Results' },
]

// Template ref to a child component: call the method it exposes.
const assistant = ref<{ open: () => void }>()

useSeoMeta({
  title: `${project.title} — Case study · ${profile.name}`,
  description: project.summary,
  ogTitle: `${project.title} — Case study`,
  ogDescription: project.summary,
  ogType: 'article',
})

// Structured data for this case study.
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  'name': project.title,
  'description': project.summary,
  'genre': project.category,
  'keywords': project.tags.join(', '),
  'creator': { '@type': 'Person', 'name': profile.name },
  ...(isRealUrl(project.liveUrl) && { url: project.liveUrl }),
  ...(isRealUrl(project.repoUrl) && { codeRepository: project.repoUrl }),
})
</script>

<template>
  <div class="project-page" :style="coverStyle">
    <!-- Hero -->
    <header class="p-hero">
      <div class="glow" aria-hidden="true">
        <span class="blob b1" />
        <span class="blob b2" />
      </div>
      <div class="container">
        <NuxtLink to="/#projects" class="back">
          <AppIcon name="arrowLeft" :size="16" /> All projects
        </NuxtLink>

        <p v-reveal class="category">
          Case study · {{ project.category }}
        </p>
        <h1 v-reveal="60">
          {{ project.title }}
        </h1>
        <p v-reveal="120" class="summary">
          {{ project.summary }}
        </p>

        <dl v-reveal="180" class="meta">
          <div>
            <dt>Role</dt>
            <dd>{{ project.role }}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{{ project.timeline }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{{ project.status }}</dd>
          </div>
        </dl>

        <ul v-reveal="220" class="tags" aria-label="Tech used">
          <li v-for="tag in project.tags" :key="tag" class="chip">
            {{ tag }}
          </li>
        </ul>

        <div v-reveal="260" class="actions">
          <button type="button" class="btn btn-primary" @click="assistant?.open()">
            <AppIcon name="sparkles" :size="18" /> Ask the Project Guide
          </button>
          <a v-if="isRealUrl(project.liveUrl)" :href="project.liveUrl" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
            <AppIcon name="external" :size="18" /> Live demo
          </a>
          <a v-if="isRealUrl(project.repoUrl)" :href="project.repoUrl" target="_blank" rel="noopener noreferrer" class="btn btn-ghost">
            <AppIcon name="github" :size="18" /> Source code
          </a>
        </div>
      </div>
    </header>

    <!-- In-page navigation -->
    <nav class="toc" aria-label="On this page">
      <div class="container toc-inner">
        <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">{{ s.label }}</a>
      </div>
    </nav>

    <!-- Overview -->
    <section id="overview" class="section" aria-labelledby="overview-title">
      <div class="container">
        <SectionHeading id="overview-title" eyebrow="01 · Overview" title="The problem and the solution." />
        <div class="two-col">
          <article v-reveal class="card panel">
            <p class="panel-label problem">
              The problem
            </p>
            <p>{{ project.problem }}</p>
          </article>
          <article v-reveal="100" class="card panel">
            <p class="panel-label solution">
              The solution
            </p>
            <p>{{ project.solution }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="section tight" aria-labelledby="features-title">
      <div class="container">
        <SectionHeading id="features-title" eyebrow="02 · Features" title="What it does." />
        <ul class="features">
          <li v-for="(f, i) in project.features" :key="f.title" v-reveal="i * 80" class="card feature">
            <span class="feature-num">0{{ i + 1 }}</span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.description }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Architecture -->
    <section id="architecture" class="section tight" aria-labelledby="architecture-title">
      <div class="container">
        <SectionHeading id="architecture-title" eyebrow="03 · Architecture" title="How it's built, end to end.">
          Press Play to follow a request through the system, or select a component to see its job.
        </SectionHeading>
        <div v-reveal>
          <ArchitectureExplorer :project="project" />
        </div>
      </div>
    </section>

    <!-- Decisions -->
    <section id="decisions" class="section tight" aria-labelledby="decisions-title">
      <div class="container">
        <SectionHeading id="decisions-title" eyebrow="04 · Decisions" title="Key technical decisions." />
        <ul class="decisions">
          <li v-for="(d, i) in project.decisions" :key="d.choice" v-reveal="i * 70" class="decision">
            <AppIcon name="check" :size="20" class="decision-icon" />
            <div>
              <h3>{{ d.choice }}</h3>
              <p>{{ d.reason }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Challenges -->
    <section id="challenges" class="section tight" aria-labelledby="challenges-title">
      <div class="container">
        <SectionHeading id="challenges-title" eyebrow="05 · Challenges" title="Hard problems and how I solved them." />
        <div class="challenges">
          <article v-for="(c, i) in project.challenges" :key="c.title" v-reveal="i * 90" class="card challenge">
            <h3>{{ c.title }}</h3>
            <p><span class="tag-problem">Problem</span>{{ c.problem }}</p>
            <p><span class="tag-fix">Fix</span>{{ c.solution }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Results -->
    <section id="results" class="section tight" aria-labelledby="results-title">
      <div class="container">
        <SectionHeading id="results-title" eyebrow="06 · Results" title="Outcomes and lessons." />
        <dl v-reveal class="card outcomes">
          <div v-for="o in project.outcomes" :key="o.label" class="outcome">
            <dt>{{ o.label }}</dt>
            <dd class="gradient-text">
              {{ o.value }}
            </dd>
          </div>
        </dl>
        <ul class="learnings">
          <li v-for="(l, i) in project.learnings" :key="l" v-reveal="i * 70">
            {{ l }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Next project -->
    <section class="section tight" aria-label="Next project">
      <div class="container">
        <NuxtLink v-reveal :to="`/projects/${nextProject.slug}`" class="card next">
          <span class="next-label">Next project</span>
          <span class="next-title">{{ nextProject.title }}</span>
          <span class="next-arrow" aria-hidden="true"><AppIcon name="arrowRight" :size="22" /></span>
        </NuxtLink>
        <p class="cta">
          Want to build something like this?
          <NuxtLink to="/#contact">
            Let's talk →
          </NuxtLink>
        </p>
      </div>
    </section>

    <ClientOnly>
      <ProjectAssistant ref="assistant" :project="project" />
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Hero */
.p-hero {
  position: relative;
  padding: calc(var(--header-h) + 48px) 0 56px;
  overflow: hidden;
  isolation: isolate;
}

.glow {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 46vw;
  max-width: 620px;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.28;
}

.b1 {
  top: -30%;
  right: -8%;
  background: var(--c1);
}

.b2 {
  top: 10%;
  right: 22%;
  background: var(--c2);
  opacity: 0.18;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s, gap 0.2s;
}

.back:hover {
  color: var(--text);
  gap: 12px;
}

.category {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-2);
}

h1 {
  max-width: 880px;
  margin-top: 14px;
  font-size: clamp(34px, 6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.035em;
}

.summary {
  max-width: 680px;
  margin-top: 18px;
  font-size: clamp(16px, 1.8vw, 19px);
  color: var(--text-muted);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 40px;
  margin: 32px 0 0;
}

.meta dt {
  font-size: 12.5px;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.meta dd {
  margin: 4px 0 0;
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

/* Sticky in-page nav */
.toc {
  position: sticky;
  top: var(--header-h);
  z-index: 10;
  border-block: 1px solid var(--border);
  background: var(--header-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.toc-inner {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.toc-inner::-webkit-scrollbar {
  display: none;
}

.toc a {
  flex-shrink: 0;
  padding: 14px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s;
}

.toc a:hover {
  color: var(--text);
}

.section.tight {
  padding-top: clamp(40px, 6vw, 72px);
}

/* Anchors must clear both the header and the sticky in-page nav. */
section[id] {
  scroll-margin-top: calc(var(--header-h) + 56px);
}

/* Overview */
.two-col {
  display: grid;
  gap: 20px;
}

.panel {
  padding: 28px;
  font-size: 16.5px;
  color: var(--text-muted);
}

.panel-label {
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 15px;
}

.panel-label.problem {
  color: var(--accent-3);
}

.panel-label.solution {
  color: var(--success);
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature {
  padding: 24px;
}

.feature-num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent-2);
}

.feature h3 {
  margin: 10px 0 8px;
  font-size: 18px;
}

.feature p {
  color: var(--text-muted);
  font-size: 15px;
}

/* Decisions */
.decisions {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.decision {
  display: flex;
  gap: 16px;
  padding: 20px 4px;
  border-bottom: 1px solid var(--border);
}

.decision-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--success);
}

.decision h3 {
  font-size: 17.5px;
}

.decision p {
  margin-top: 6px;
  color: var(--text-muted);
}

/* Challenges */
.challenges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 20px;
}

.challenge {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
}

.challenge h3 {
  font-size: 18px;
}

.challenge p {
  color: var(--text-muted);
  font-size: 15px;
}

.tag-problem,
.tag-fix {
  display: inline-block;
  margin-right: 8px;
  padding: 1px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.tag-problem {
  color: var(--accent-3);
  background: color-mix(in srgb, var(--accent-3) 14%, transparent);
}

.tag-fix {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 14%, transparent);
}

/* Results */
.outcomes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  margin: 0;
}

.outcome {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  padding: 28px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.outcome:last-child {
  border-bottom: 0;
}

.outcome dd {
  margin: 0;
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.outcome dt {
  color: var(--text-muted);
  font-size: 14.5px;
}

.learnings {
  display: grid;
  gap: 10px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.learnings li {
  position: relative;
  padding-left: 28px;
  color: var(--text-muted);
}

.learnings li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--accent-2);
}

/* Next project */
.next {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 6px 20px;
  padding: clamp(24px, 4vw, 40px);
  background:
    radial-gradient(60% 140% at 100% 50%, color-mix(in srgb, var(--c2) 18%, transparent), transparent),
    var(--surface);
  transition: border-color 0.25s, transform 0.3s var(--ease);
}

.next:hover {
  border-color: var(--border-strong);
  transform: translateY(-3px);
}

.next-label {
  grid-column: 1;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.next-title {
  grid-column: 1;
  font-size: clamp(20px, 3vw, 30px);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.next-arrow {
  grid-column: 2;
  grid-row: 1 / 3;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--gradient);
  color: #fff;
  transition: transform 0.3s var(--ease);
}

.next:hover .next-arrow {
  transform: translateX(4px);
}

.cta {
  margin-top: 28px;
  text-align: center;
  color: var(--text-muted);
}

.cta a {
  font-weight: 600;
  color: var(--accent-2);
}

@media (min-width: 800px) {
  .two-col {
    grid-template-columns: 1fr 1fr;
  }

  .outcome {
    border-bottom: 0;
    border-right: 1px solid var(--border);
  }

  .outcome:last-child {
    border-right: 0;
  }
}
</style>
