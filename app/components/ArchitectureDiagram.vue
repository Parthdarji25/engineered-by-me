<script setup lang="ts">
import type { ArchLayer } from '~/data/projects'

/**
 * Presentational diagram: layers left → right (top → bottom on phones).
 * It only receives state through props and reports clicks through an event;
 * ArchitectureExplorer owns the state.
 */
const props = defineProps<{
  layers: ArchLayer[]
  /** Nodes touched by the current flow step. */
  activeNodes: string[]
  selectedId: string | null
}>()

const emit = defineEmits<{ select: [id: string] }>()

const activeSet = computed(() => new Set(props.activeNodes))
const hasActive = computed(() => activeSet.value.size > 0)

// A connector "carries traffic" when the step touches both layers it joins.
function connectorLive(index: number) {
  const touches = (layer?: ArchLayer) => !!layer?.nodes.some(n => activeSet.value.has(n.id))
  return touches(props.layers[index]) && touches(props.layers[index + 1])
}
</script>

<template>
  <div class="diagram" role="group" aria-label="System architecture">
    <template v-for="(layer, li) in layers" :key="layer.name">
      <div class="layer">
        <p class="layer-name">
          <span class="layer-num">0{{ li + 1 }}</span>
          {{ layer.name }}
        </p>
        <div class="nodes">
          <button
            v-for="node in layer.nodes"
            :key="node.id"
            type="button"
            class="node"
            :class="{
              'is-active': activeSet.has(node.id),
              'is-dim': hasActive && !activeSet.has(node.id),
              'is-selected': selectedId === node.id,
            }"
            :aria-pressed="selectedId === node.id"
            @click="emit('select', node.id)"
          >
            <span class="node-name">{{ node.name }}</span>
            <span class="node-tech">{{ node.tech }}</span>
          </button>
        </div>
      </div>

      <div v-if="li < layers.length - 1" class="connector" :class="{ 'is-live': connectorLive(li) }" aria-hidden="true">
        <span class="line" />
        <span class="packet" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.diagram {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.layer {
  padding: 16px;
  border-radius: var(--radius);
  border: 1px dashed var(--border-strong);
  background: color-mix(in srgb, var(--bg-elevated) 55%, transparent);
}

.layer-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.layer-num {
  color: var(--accent-2);
}

.nodes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  text-align: left;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition:
    opacity 0.35s var(--ease),
    border-color 0.25s,
    background-color 0.25s,
    box-shadow 0.35s var(--ease),
    transform 0.35s var(--ease);
}

.node:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
}

.node-name {
  font-weight: 600;
  font-size: 14.5px;
  line-height: 1.3;
}

.node-tech {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--text-dim);
}

.node.is-dim {
  opacity: 0.4;
}

.node.is-active {
  border-color: var(--accent-2);
  background: color-mix(in srgb, var(--accent-2) 12%, var(--surface));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-2) 18%, transparent), 0 10px 30px -12px var(--accent-2);
}

.node.is-selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
  opacity: 1;
}

/* Connectors: vertical on phones */
.connector {
  position: relative;
  align-self: center;
  width: 2px;
  height: 36px;
}

.line {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(to bottom, var(--border-strong) 0 4px, transparent 4px 8px);
}

.packet {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: var(--text-dim);
  opacity: 0.5;
  animation: travel-y 2.4s linear infinite;
}

.connector.is-live .line {
  background: var(--gradient);
}

.connector.is-live .packet {
  background: var(--accent-2);
  box-shadow: 0 0 12px var(--accent-2);
  opacity: 1;
  animation-duration: 0.9s;
}

@keyframes travel-y {
  from {
    top: -4px;
  }

  to {
    top: calc(100% - 4px);
  }
}

@keyframes travel-x {
  from {
    left: -4px;
  }

  to {
    left: calc(100% - 4px);
  }
}

/* Desktop: layers side by side, connectors horizontal */
@media (min-width: 900px) {
  .diagram {
    flex-direction: row;
    align-items: stretch;
  }

  .layer {
    flex: 1 1 0;
    min-width: 0;
  }

  .nodes {
    grid-template-columns: 1fr;
  }

  .connector {
    width: 32px;
    height: 2px;
    flex-shrink: 0;
  }

  .line {
    background: repeating-linear-gradient(to right, var(--border-strong) 0 4px, transparent 4px 8px);
  }

  .packet {
    top: 50%;
    left: 0;
    margin: -4px 0 0;
    animation-name: travel-x;
  }
}
</style>
