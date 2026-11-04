<script setup lang="ts">
import { profile } from '~/data/profile'

const { isDark } = useTheme()
const sceneReady = ref(false)
const hero = ref<HTMLElement>()

// Headline split into words so each one can blur in on its own delay.
const line1 = `Hi, I'm ${profile.firstName}.`.split(' ')
const line2 = profile.headline.split(' ')

// ── Pointer + scroll → CSS variables (read by the spotlight, cards and parallax) ──
let frame = 0
let pointer = { x: 0, y: 0, px: 0, py: 0 }
let scrollProgress = 0

function flush() {
  frame = 0
  const el = hero.value
  if (!el) return
  el.style.setProperty('--mx', pointer.x.toFixed(3))
  el.style.setProperty('--my', pointer.y.toFixed(3))
  el.style.setProperty('--spot-x', `${pointer.px}px`)
  el.style.setProperty('--spot-y', `${pointer.py}px`)
  el.style.setProperty('--p', scrollProgress.toFixed(3))
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(flush)
}

function onPointerMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !hero.value) return
  const rect = hero.value.getBoundingClientRect()
  pointer = {
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    px: e.clientX - rect.left,
    py: e.clientY - rect.top,
  }
  schedule()
}

function onScroll() {
  const h = hero.value?.offsetHeight || 1
  scrollProgress = Math.min(Math.max(window.scrollY / h, 0), 1)
  schedule()
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <section id="home" ref="hero" class="hero" aria-labelledby="hero-title" @pointermove="onPointerMove">
    <!-- Background layers -->
    <div class="bg" aria-hidden="true">
      <div class="aurora">
        <span class="a1" />
        <span class="a2" />
        <span class="a3" />
      </div>
      <div class="floor" />
      <div class="spotlight" />
      <div class="fade" />
    </div>

    <div class="container grid">
      <div class="copy">
        <p v-if="profile.available" class="badge">
          <span class="badge-text">
            <span class="pulse" aria-hidden="true" />
            Open to new opportunities
          </span>
        </p>

        <h1 id="hero-title" class="title">
          <span class="line">
            <span v-for="(word, i) in line1" :key="`a${i}`" class="w" :style="{ '--i': i }">{{ word }}&nbsp;</span>
          </span>
          <span class="line shimmer">
            <span v-for="(word, i) in line2" :key="`b${i}`" class="w" :style="{ '--i': i + line1.length }">{{ word }}&nbsp;</span>
          </span>
        </h1>
        <p class="sr-only">
          {{ profile.roles.join(', ') }}.
        </p>

        <p class="intro">
          {{ profile.intro }}
        </p>

        <div class="ctas">
          <a v-magnetic href="#projects" class="btn btn-primary">
            View my work
            <AppIcon name="arrowRight" :size="18" />
          </a>
          <a v-if="profile.resumeUrl" v-magnetic :href="profile.resumeUrl" class="btn btn-ghost" download>
            Download résumé
          </a>
          <a v-else v-magnetic href="#contact" class="btn btn-ghost">
            Get in touch
          </a>
        </div>

        <ul class="socials" aria-label="Social profiles">
          <li v-for="social in profile.socials" :key="social.label">
            <a :href="social.href" target="_blank" rel="noopener noreferrer" :aria-label="social.label" :title="social.label">
              <AppIcon :name="social.icon" :size="19" />
            </a>
          </li>
        </ul>
      </div>

      <div class="visual" :class="{ 'is-ready': sceneReady }">
        <div class="halo" aria-hidden="true" />
        <div class="orb" aria-hidden="true" />
        <ClientOnly>
          <LazyHeroScene :dark="isDark" @ready="sceneReady = true" />
        </ClientOnly>
        <HeroAiCards />
      </div>
    </div>

    <a href="#experience" class="scroll-cue" aria-label="Scroll to experience section">
      <span class="mouse"><span class="wheel" /></span>
      <span class="cue-text">Scroll</span>
    </a>
  </section>
</template>

<style scoped>
.hero {
  --mx: 0;
  --my: 0;
  --p: 0;
  --spot-x: 50%;
  --spot-y: 40%;

  position: relative;
  min-height: min(100svh, 1000px);
  display: flex;
  align-items: center;
  padding-top: calc(var(--header-h) + 32px);
  padding-bottom: 96px;
  overflow: hidden;
  isolation: isolate;
}

/* ── Background ── */
.bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.aurora span {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.38;
  mix-blend-mode: screen;
}

:root[data-theme='light'] .aurora span {
  mix-blend-mode: multiply;
  opacity: 0.2;
}

.a1 {
  width: 46vw;
  height: 46vw;
  top: -18vw;
  right: -8vw;
  background: var(--accent);
  animation: drift-1 18s ease-in-out infinite;
}

.a2 {
  width: 36vw;
  height: 36vw;
  top: 10vh;
  left: -12vw;
  background: var(--accent-2);
  animation: drift-2 22s ease-in-out infinite;
}

.a3 {
  width: 28vw;
  height: 28vw;
  bottom: -10vw;
  left: 35%;
  background: var(--accent-3);
  opacity: 0.22;
  animation: drift-3 26s ease-in-out infinite;
}

/* Perspective grid "floor" scrolling toward the viewer */
.floor {
  position: absolute;
  left: -50%;
  right: -50%;
  bottom: -2%;
  height: 55%;
  background-image:
    linear-gradient(color-mix(in srgb, var(--accent-2) 30%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 30%, transparent) 1px, transparent 1px);
  background-size: 64px 64px;
  transform: perspective(520px) rotateX(64deg);
  transform-origin: center bottom;
  mask-image: linear-gradient(to top, #000 0%, rgb(0 0 0 / 0.5) 35%, transparent 80%);
  opacity: 0.5;
  animation: floor-move 2.6s linear infinite;
}

/* Soft light that follows the cursor */
.spotlight {
  position: absolute;
  inset: 0;
  background: radial-gradient(520px circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%);
}

.fade {
  position: absolute;
  inset: auto 0 0;
  height: 30%;
  background: linear-gradient(to bottom, transparent, var(--bg));
}

/* ── Layout ── */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}

.copy {
  position: relative;
  z-index: 1;
  /* scroll-out parallax */
  transform: translateY(calc(var(--p) * -70px));
  opacity: calc(1 - var(--p) * 1.1);
  will-change: transform, opacity;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 14px 4px 4px;
  margin-bottom: 24px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg-elevated) 60%, transparent);
  backdrop-filter: blur(8px);
  font-size: 13.5px;
  color: var(--text-muted);
}

.badge-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pulse {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
}

.pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--success);
  animation: ping 1.8s var(--ease) infinite;
}

/* Headline */
.title {
  font-size: clamp(38px, 6.6vw, 74px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.04;
}

.line {
  display: block;
}

.w {
  display: inline-block;
  animation: word-in 1s var(--ease) both;
  animation-delay: calc(var(--i) * 70ms + 150ms);
}

/* Animated gradient sweeping through the second line */
.shimmer .w {
  background: linear-gradient(100deg, var(--accent) 0%, var(--accent-2) 30%, var(--accent-3) 55%, var(--accent) 80%, var(--accent-2) 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation:
    word-in 1s var(--ease) both,
    sheen 8s linear infinite;
  animation-delay: calc(var(--i) * 70ms + 150ms), 0s;
}

.intro {
  max-width: 540px;
  margin-top: 20px;
  font-size: clamp(16px, 1.7vw, 18px);
  color: var(--text-muted);
}

.ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.socials {
  display: flex;
  gap: 10px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.socials a {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg-elevated) 50%, transparent);
  color: var(--text-muted);
  transition: color 0.2s, transform 0.25s var(--ease), border-color 0.2s, box-shadow 0.25s;
}

.socials a:hover {
  color: var(--text);
  border-color: var(--accent-2);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px -10px var(--accent-2);
}

/* ── 3D visual ── */
.visual {
  position: relative;
  height: clamp(340px, 88vw, 460px);
  transform: translateY(calc(var(--p) * 90px)) scale(calc(1 - var(--p) * 0.08));
  will-change: transform;
}

.halo {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--accent-2) 25%, transparent);
  box-shadow:
    inset 0 0 80px color-mix(in srgb, var(--accent) 18%, transparent),
    0 0 120px color-mix(in srgb, var(--accent) 12%, transparent);
  animation: halo 6s ease-in-out infinite;
}

.halo::before,
.halo::after {
  content: '';
  position: absolute;
  inset: -9%;
  border-radius: 50%;
  border: 1px dashed color-mix(in srgb, var(--accent) 25%, transparent);
  animation: spin 60s linear infinite;
}

.halo::after {
  inset: -18%;
  border-style: solid;
  border-color: transparent;
  border-top-color: color-mix(in srgb, var(--accent-2) 50%, transparent);
  animation-duration: 9s;
}

.orb {
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--accent-2) 55%, transparent), transparent 55%),
    radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--accent) 65%, transparent), transparent 60%);
  filter: blur(40px);
  opacity: 0.55;
  transition: opacity 1s var(--ease), inset 1s var(--ease);
}

.visual.is-ready .orb {
  inset: 30%;
  opacity: 0.35;
}

/* ── Scroll cue ── */
.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 22px;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  translate: -50% 0;
  color: var(--text-dim);
  opacity: calc(1 - var(--p) * 4);
}

.mouse {
  display: flex;
  justify-content: center;
  width: 22px;
  height: 34px;
  padding-top: 6px;
  border-radius: 12px;
  border: 1.5px solid var(--border-strong);
}

.wheel {
  width: 3px;
  height: 7px;
  border-radius: 2px;
  background: var(--accent-2);
  animation: wheel 1.8s ease-in-out infinite;
}

.cue-text {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* ── Keyframes ── */
@keyframes word-in {
  from {
    opacity: 0;
    filter: blur(12px);
    transform: translateY(0.35em);
  }
}

@keyframes sheen {
  to {
    background-position: -300% 0;
  }
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes drift-1 {
  50% {
    transform: translate(-8vw, 6vh) scale(1.15);
  }
}

@keyframes drift-2 {
  50% {
    transform: translate(10vw, -4vh) scale(0.9);
  }
}

@keyframes drift-3 {
  50% {
    transform: translate(-12vw, -8vh) scale(1.2);
  }
}

@keyframes floor-move {
  to {
    background-position: 0 64px;
  }
}

@keyframes halo {
  50% {
    transform: scale(1.03);
    opacity: 0.8;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes wheel {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  100% {
    transform: translateY(10px);
    opacity: 0;
  }
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: 1.05fr 1fr;
  }

  .visual {
    height: min(620px, 72vh);
  }

  .scroll-cue {
    display: flex;
  }
}

@media (max-width: 480px) {
  .ctas .btn {
    flex: 1 1 100%;
  }

  .badge {
    font-size: 12.5px;
  }
}
</style>
