<script setup lang="ts">
import { allTools } from '~/data/profile'

// Two endless rows of tools scrolling in opposite directions.
// Decorative: the same list is available in the Tech Stack section.
const half = Math.ceil(allTools.length / 2)
const rows = [allTools.slice(0, half), allTools.slice(half)]
</script>

<template>
  <div class="marquee" aria-hidden="true">
    <div v-for="(row, r) in rows" :key="r" class="row" :class="{ reverse: r === 1 }">
      <!-- Rendered twice so the loop is seamless (the track moves by exactly -50%). -->
      <ul v-for="copy in 2" :key="copy" class="track">
        <li v-for="item in row" :key="item.name" :data-category="item.group">
          <span class="dot" />{{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  display: grid;
  gap: 12px;
  padding-block: 8px 40px;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

.row {
  display: flex;
  width: max-content;
  animation: scroll-x 55s linear infinite;
}

.row.reverse {
  animation-direction: reverse;
  animation-duration: 65s;
}

.marquee:hover .row {
  animation-play-state: paused;
}

.track {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0 12px 0 0;
  list-style: none;
}

li {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg-elevated) 60%, transparent);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

li[data-category='Backend'] .dot {
  background: var(--accent-2);
  box-shadow: 0 0 8px var(--accent-2);
}

li[data-category='AI & ML'] .dot {
  background: var(--accent-3);
  box-shadow: 0 0 8px var(--accent-3);
}

li[data-category='DevOps & Tools'] .dot {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

@keyframes scroll-x {
  to {
    transform: translateX(-50%);
  }
}
</style>
