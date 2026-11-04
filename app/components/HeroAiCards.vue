<script setup lang="ts">
/**
 * Decorative "live" AI widgets floating around the 3D sphere.
 * They drift with the mouse via --mx / --my set on the hero section.
 */
const steps = ['Retrieve context', 'Reason', 'Call tools', 'Respond']
const activeStep = ref(steps.length) // SSR: everything done
const stream = 'const answer = await llm.generate({ context, tools })'
const streamed = ref(stream)

let stepTimer: ReturnType<typeof setInterval> | undefined
let streamTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  activeStep.value = 0
  stepTimer = setInterval(() => {
    activeStep.value = activeStep.value >= steps.length ? 0 : activeStep.value + 1
  }, 1100)

  let i = 0
  streamTimer = setInterval(() => {
    i = i >= stream.length + 18 ? 0 : i + 1 // brief pause at the end
    streamed.value = stream.slice(0, i)
  }, 55)
})

onBeforeUnmount(() => {
  clearInterval(stepTimer)
  clearInterval(streamTimer)
})
</script>

<template>
  <div class="cards" aria-hidden="true">
    <!-- Streaming tokens -->
    <div class="ai-card card-stream" style="--depth: 26">
      <p class="card-head">
        <span class="dot cyan" /> Streaming tokens
      </p>
      <div class="bars">
        <span v-for="n in 12" :key="n" :style="{ '--n': n }" />
      </div>
    </div>

    <!-- Code being generated -->
    <div class="ai-card card-code" style="--depth: 18">
      <p class="card-head">
        <span class="dot violet" /> model.generate()
      </p>
      <code class="code">{{ streamed }}<span class="cursor" /></code>
    </div>

    <!-- Agent pipeline -->
    <div class="ai-card card-agent" style="--depth: 34">
      <p class="card-head">
        <span class="dot green" /> Agent run
      </p>
      <ul class="steps">
        <li
          v-for="(step, i) in steps"
          :key="step"
          :class="{ done: i < activeStep, running: i === activeStep }"
        >
          <span class="tick">
            <AppIcon v-if="i < activeStep" name="check" :size="11" />
          </span>
          {{ step }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.cards {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.ai-card {
  position: absolute;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--border-strong);
  background: color-mix(in srgb, var(--bg-elevated) 70%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow);
  /* mouse parallax: deeper cards move more */
  translate: calc(var(--mx, 0) * var(--depth) * -1px) calc(var(--my, 0) * var(--depth) * -1px);
  transition: translate 0.6s var(--ease);
  animation: float 7s ease-in-out infinite;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot.cyan {
  background: var(--accent-2);
  box-shadow: 0 0 10px var(--accent-2);
}

.dot.violet {
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.dot.green {
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

/* Streaming bars */
.card-stream {
  top: 6%;
  left: 0;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 36px;
}

.bars span {
  width: 6px;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(to top, var(--accent), var(--accent-2));
  transform-origin: bottom;
  animation: bar 1.4s ease-in-out infinite;
  animation-delay: calc(var(--n) * -0.17s);
}

/* Code stream */
.card-code {
  top: 2%;
  right: 0;
  width: 250px;
  animation-delay: -2.5s;
}

.code {
  display: block;
  min-height: 2.9em;
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  display: inline-block;
  width: 6px;
  height: 1em;
  margin-left: 1px;
  vertical-align: -2px;
  background: var(--accent-2);
  animation: blink 0.9s steps(1) infinite;
}

/* Agent steps */
.card-agent {
  bottom: 6%;
  right: 4%;
  animation-delay: -4.5s;
}

.steps {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-dim);
  transition: color 0.3s;
}

.steps li.done {
  color: var(--text-muted);
}

.steps li.running {
  color: var(--text);
}

.tick {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong);
  color: #fff;
  transition: background-color 0.3s, border-color 0.3s;
}

.done .tick {
  border-color: transparent;
  background: var(--success);
}

.running .tick {
  border-color: var(--accent-2);
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes float {
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bar {
  0%,
  100% {
    transform: scaleY(0.25);
  }

  50% {
    transform: scaleY(1);
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Phones & tablets: keep one compact card so the sphere stays visible */
@media (max-width: 959px) {
  .card-stream,
  .card-agent {
    display: none;
  }

  .card-code {
    top: auto;
    bottom: 4%;
    right: 50%;
    width: min(280px, 80vw);
    margin-right: calc(min(280px, 80vw) / -2);
  }
}
</style>
