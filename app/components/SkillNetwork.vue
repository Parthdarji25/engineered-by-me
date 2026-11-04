<script setup lang="ts">
/**
 * A small feed-forward "neural network" drawn in SVG.
 * Input nodes = skill areas → two hidden layers → output node ("PD").
 * The active area lights up its pathway and signals flow along it.
 */
const props = defineProps<{
  labels: string[]
  active: number
}>()

const emit = defineEmits<{ select: [index: number] }>()

const W = 480
const H = 440

interface Node { x: number, y: number }
interface Edge { id: string, from: Node, to: Node, layer: number }

const column = (x: number, count: number, top: number, bottom: number): Node[] =>
  Array.from({ length: count }, (_, i) => ({ x, y: count === 1 ? (top + bottom) / 2 : top + (i * (bottom - top)) / (count - 1) }))

const inputs = computed(() => column(150, props.labels.length, 60, H - 60))
const hidden1 = column(250, 5, 50, H - 50)
const hidden2 = column(345, 4, 95, H - 95)
const output: Node = { x: 432, y: H / 2 }

const connect = (from: Node[], to: Node[], layer: number, prefix: string): Edge[] =>
  from.flatMap((a, i) => to.map((b, j) => ({ id: `${prefix}${i}-${j}`, from: a, to: b, layer })))

const edges = computed(() => [
  ...connect(inputs.value, hidden1, 0, 'a'),
  ...connect(hidden1, hidden2, 1, 'b'),
  ...connect(hidden2, [output], 2, 'c'),
])

// Each skill area "activates" its own subset of hidden neurons.
const activeH1 = computed(() => new Set([0, 1, 2].map(k => (props.active + k) % hidden1.length)))
const activeH2 = computed(() => new Set([0, 1].map(k => (props.active + k) % hidden2.length)))

const activeEdges = computed(() => {
  const a = props.active
  return [
    ...[...activeH1.value].map(j => `a${a}-${j}`),
    ...[...activeH1.value].flatMap(i => [...activeH2.value].map(j => `b${i}-${j}`)),
    ...[...activeH2.value].map(i => `c${i}-0`),
  ]
})
const activeEdgeSet = computed(() => new Set(activeEdges.value))
const flowEdges = computed(() => edges.value.filter(e => activeEdgeSet.value.has(e.id)))

function onKey(e: KeyboardEvent, i: number) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('select', i)
  }
}
</script>

<template>
  <svg
    class="net"
    :viewBox="`0 0 ${W} ${H}`"
    role="group"
    aria-label="Neural network connecting my skill areas"
  >
    <defs>
      <linearGradient id="net-flow" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="432" y2="0">
        <stop offset="0" class="stop-a" />
        <stop offset="1" class="stop-b" />
      </linearGradient>
      <radialGradient id="net-glow">
        <stop offset="0" class="stop-b" stop-opacity="0.55" />
        <stop offset="1" class="stop-b" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- All connections (draw in when the section scrolls into view) -->
    <g class="edges">
      <line
        v-for="e in edges"
        :key="e.id"
        :x1="e.from.x"
        :y1="e.from.y"
        :x2="e.to.x"
        :y2="e.to.y"
        pathLength="1"
        class="edge"
        :class="{ on: activeEdgeSet.has(e.id) }"
        :style="{ '--layer': e.layer }"
      />
    </g>

    <!-- Signals travelling along the active pathway (re-keyed so they restart on change) -->
    <g :key="active" class="flows">
      <line
        v-for="e in flowEdges"
        :key="e.id"
        :x1="e.from.x"
        :y1="e.from.y"
        :x2="e.to.x"
        :y2="e.to.y"
        pathLength="1"
        class="flow"
        :style="{ '--layer': e.layer }"
      />
    </g>

    <!-- Hidden layers -->
    <circle
      v-for="(n, i) in hidden1"
      :key="`h1-${i}`"
      :cx="n.x"
      :cy="n.y"
      r="7"
      class="neuron"
      :class="{ on: activeH1.has(i) }"
    />
    <circle
      v-for="(n, i) in hidden2"
      :key="`h2-${i}`"
      :cx="n.x"
      :cy="n.y"
      r="7"
      class="neuron"
      :class="{ on: activeH2.has(i) }"
    />

    <!-- Output -->
    <circle :cx="output.x" :cy="output.y" r="46" fill="url(#net-glow)" class="halo" />
    <circle :cx="output.x" :cy="output.y" r="22" class="out" />
    <text :x="output.x" :y="output.y + 5" text-anchor="middle" class="out-text">PD</text>
    <text :x="output.x" :y="output.y + 66" text-anchor="middle" class="caption">product</text>

    <!-- Inputs: one per skill area, clickable -->
    <g
      v-for="(n, i) in inputs"
      :key="`in-${i}`"
      class="input"
      :class="{ on: i === active }"
      role="button"
      tabindex="0"
      :aria-label="`Show ${labels[i]}`"
      :aria-pressed="i === active"
      @click="emit('select', i)"
      @keydown="onKey($event, i)"
    >
      <circle :cx="n.x" :cy="n.y" r="18" class="ring" />
      <circle :cx="n.x" :cy="n.y" r="10" class="core" />
      <text :x="n.x - 30" :y="n.y + 5" text-anchor="end" class="label">{{ labels[i] }}</text>
    </g>

    <text x="150" y="24" text-anchor="middle" class="caption">skills</text>
    <text x="297" y="24" text-anchor="middle" class="caption">experience</text>
  </svg>
</template>

<style scoped>
.net {
  width: 100%;
  height: auto;
  overflow: visible;
}

.stop-a {
  stop-color: var(--accent);
}

.stop-b {
  stop-color: var(--accent-2);
}

/* Connections */
.edge {
  stroke: var(--border-strong);
  stroke-width: 1;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition:
    stroke 0.5s var(--ease),
    stroke-width 0.5s var(--ease),
    opacity 0.5s var(--ease),
    stroke-dashoffset 1.1s var(--ease);
  transition-delay: 0s, 0s, 0s, calc(var(--layer) * 0.35s);
}

.edge.on {
  stroke: url(#net-flow);
  stroke-width: 1.8;
}

/* Hidden until the section is revealed, then each layer draws itself in. */
.js .net-wrap:not([data-visible]) .edge {
  stroke-dashoffset: 1;
}

.js .net-wrap:not([data-visible]) .flows {
  opacity: 0;
}

.flows {
  transition: opacity 0.4s 1s;
}

.flow {
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 0.08 0.92;
  stroke-dashoffset: 1;
  filter: drop-shadow(0 0 4px var(--accent-2));
  animation: flow 1.6s linear infinite;
  animation-delay: calc(var(--layer) * 0.3s);
}

:root[data-theme='light'] .flow {
  stroke: var(--accent-2);
}

/* Neurons */
.neuron {
  fill: var(--bg-elevated);
  stroke: var(--border-strong);
  stroke-width: 1.5;
  transition: fill 0.4s, stroke 0.4s;
}

.neuron.on {
  fill: var(--accent-2);
  stroke: var(--accent-2);
  animation: pulse 1.6s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

/* Output */
.out {
  fill: url(#net-flow);
}

.out-text {
  fill: #fff;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.5px;
}

.halo {
  animation: pulse 2.4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

/* Inputs */
.input {
  cursor: pointer;
  outline: none;
}

.input .ring {
  fill: none;
  stroke: var(--border-strong);
  stroke-width: 1.5;
  transition: stroke 0.3s, r 0.3s;
}

.input .core {
  fill: var(--surface-strong);
  stroke: var(--border-strong);
  transition: fill 0.3s, stroke 0.3s;
}

.input .label {
  fill: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  transition: fill 0.3s;
}

.input:hover .label,
.input:focus-visible .label {
  fill: var(--text);
}

.input:focus-visible .ring {
  stroke: var(--accent-2);
}

.input.on .ring {
  stroke: var(--accent-2);
  animation: ring 1.8s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.input.on .core {
  fill: url(#net-flow);
  stroke: transparent;
}

.input.on .label {
  fill: var(--text);
}

.caption {
  fill: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@keyframes flow {
  from {
    stroke-dashoffset: 1;
  }

  to {
    stroke-dashoffset: -0.08;
  }
}

@keyframes pulse {
  50% {
    opacity: 0.6;
    transform: scale(0.88);
  }
}

@keyframes ring {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .flows {
    display: none;
  }
}
</style>
