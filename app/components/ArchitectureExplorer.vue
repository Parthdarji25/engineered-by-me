<script setup lang="ts">
import type { ArchNode, Project } from '~/data/projects'

const props = defineProps<{ project: Project }>()

const STEP_MS = 2600

const flowIndex = ref(0)
const stepIndex = ref(-1) // -1 = no step selected (whole diagram visible)
const playing = ref(false)
const selectedId = ref<string | null>(null)

const flow = computed(() => props.project.flows[flowIndex.value]!)
const step = computed(() => flow.value.steps[stepIndex.value])
const activeNodes = computed(() => step.value?.nodes ?? [])
const progress = computed(() => (stepIndex.value + 1) / flow.value.steps.length)

// Look-up table: node id → node + its layer name.
const nodeIndex = computed(() => {
  const map = new Map<string, ArchNode & { layer: string }>()
  for (const layer of props.project.architecture) {
    for (const node of layer.nodes) map.set(node.id, { ...node, layer: layer.name })
  }
  return map
})

const selected = computed(() => (selectedId.value ? nodeIndex.value.get(selectedId.value) : undefined))

// Which steps (across all flows) involve the selected node.
const selectedUsage = computed(() => {
  if (!selectedId.value) return []
  return props.project.flows.flatMap(f =>
    f.steps.filter(s => s.nodes.includes(selectedId.value!)).map(s => `${f.name}: ${s.title}`),
  )
})

let timer: ReturnType<typeof setInterval> | undefined

function stop() {
  playing.value = false
  clearInterval(timer)
}

function play() {
  if (stepIndex.value >= flow.value.steps.length - 1) stepIndex.value = -1
  playing.value = true
  next()
  timer = setInterval(() => {
    if (stepIndex.value >= flow.value.steps.length - 1) stop()
    else next()
  }, STEP_MS)
}

function next() {
  stepIndex.value = Math.min(stepIndex.value + 1, flow.value.steps.length - 1)
}

function prev() {
  stop()
  stepIndex.value = Math.max(stepIndex.value - 1, 0)
}

function goTo(i: number) {
  stop()
  stepIndex.value = i
}

function reset() {
  stop()
  stepIndex.value = -1
}

function toggleNode(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}

// Switching flow starts it from the beginning.
watch(flowIndex, reset)

onBeforeUnmount(stop)
</script>

<template>
  <div class="explorer">
    <div class="toolbar">
      <div v-if="project.flows.length > 1" class="flow-tabs" role="tablist" aria-label="Choose a flow">
        <button
          v-for="(f, i) in project.flows"
          :key="f.name"
          type="button"
          role="tab"
          class="flow-tab"
          :class="{ active: flowIndex === i }"
          :aria-selected="flowIndex === i"
          @click="flowIndex = i"
        >
          {{ f.name }}
        </button>
      </div>
      <p v-else class="flow-title">
        Flow: <strong>{{ flow.name }}</strong>
      </p>

      <div class="controls">
        <button type="button" class="ctrl" aria-label="Previous step" :disabled="stepIndex <= 0" @click="prev">
          <AppIcon name="arrowRight" :size="16" class="flip" />
        </button>
        <button type="button" class="btn btn-primary play" @click="playing ? stop() : play()">
          <AppIcon :name="playing ? 'pause' : 'play'" :size="16" />
          {{ playing ? 'Pause' : stepIndex >= 0 ? 'Resume' : 'Play flow' }}
        </button>
        <button
          type="button"
          class="ctrl"
          aria-label="Next step"
          :disabled="stepIndex >= flow.steps.length - 1"
          @click="stop(); next()"
        >
          <AppIcon name="arrowRight" :size="16" />
        </button>
        <button v-if="stepIndex >= 0" type="button" class="reset" @click="reset">
          Reset
        </button>
      </div>
    </div>

    <div class="progress" aria-hidden="true">
      <span :style="{ transform: `scaleX(${Math.max(progress, 0)})` }" />
    </div>

    <ArchitectureDiagram
      :layers="project.architecture"
      :active-nodes="activeNodes"
      :selected-id="selectedId"
      @select="toggleNode"
    />

    <div class="below">
      <ol class="steps" :aria-label="`${flow.name} steps`">
        <li v-for="(s, i) in flow.steps" :key="s.title">
          <button
            type="button"
            class="step"
            :class="{ 'is-current': i === stepIndex, 'is-done': i < stepIndex }"
            :aria-current="i === stepIndex ? 'step' : undefined"
            @click="goTo(i)"
          >
            <span class="step-num">{{ i + 1 }}</span>
            <span class="step-body">
              <span class="step-title">{{ s.title }}</span>
              <span class="step-text">{{ s.description }}</span>
            </span>
          </button>
        </li>
      </ol>

      <aside class="details card" aria-live="polite">
        <Transition name="fade" mode="out-in">
          <div v-if="selected" :key="selected.id">
            <p class="details-layer">
              {{ selected.layer }}
            </p>
            <h3>{{ selected.name }}</h3>
            <p class="chip">
              {{ selected.tech }}
            </p>
            <p class="details-text">
              {{ selected.description }}
            </p>
            <template v-if="selectedUsage.length">
              <p class="details-sub">
                Involved in
              </p>
              <ul class="usage">
                <li v-for="u in selectedUsage" :key="u">
                  {{ u }}
                </li>
              </ul>
            </template>
          </div>
          <div v-else key="empty" class="empty">
            <AppIcon name="cursor" :size="22" />
            <p>Select any component in the diagram to see what it does, or press <strong>Play flow</strong> to watch a request move through the system.</p>
          </div>
        </Transition>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.flow-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.flow-tab {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s, background-color 0.2s;
}

.flow-tab.active {
  color: var(--text);
  background: var(--surface-strong);
}

.flow-title {
  color: var(--text-muted);
  font-size: 15px;
}

.flow-title strong {
  color: var(--text);
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: background-color 0.2s, opacity 0.2s;
}

.ctrl:hover:not(:disabled) {
  background: var(--surface-strong);
}

.ctrl:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.flip {
  transform: rotate(180deg);
}

.play {
  min-height: 40px;
  padding: 0 18px;
  font-size: 14px;
}

.play:hover svg {
  transform: none;
}

.reset {
  padding: 0 8px;
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
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
  transition: transform 0.5s var(--ease);
}

.below {
  display: grid;
  gap: 20px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  border-radius: 14px;
  border: 1px solid transparent;
  transition: background-color 0.25s, border-color 0.25s;
}

.step:hover {
  background: var(--surface);
}

.step.is-current {
  background: var(--surface);
  border-color: var(--accent-2);
}

.step-num {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-muted);
  transition: all 0.25s;
}

.step.is-done .step-num {
  border-color: transparent;
  background: var(--surface-strong);
}

.step.is-current .step-num {
  border-color: transparent;
  background: var(--gradient);
  color: #fff;
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-title {
  font-weight: 600;
}

.step-text {
  font-size: 14.5px;
  color: var(--text-muted);
}

.details {
  padding: 24px;
  align-self: start;
}

.details-layer {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-2);
}

.details h3 {
  margin: 8px 0 10px;
  font-size: 20px;
}

.details-text {
  margin-top: 14px;
  color: var(--text-muted);
}

.details-sub {
  margin-top: 18px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
}

.usage {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--text-muted);
  font-size: 14.5px;
}

.empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--text-muted);
}

.empty svg {
  color: var(--accent-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (min-width: 900px) {
  .below {
    grid-template-columns: 1.4fr 1fr;
  }

  .details {
    position: sticky;
    top: calc(var(--header-h) + 16px);
  }
}
</style>
