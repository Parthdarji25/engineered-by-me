<script setup lang="ts">
// Thin gradient bar at the very top showing how far down the page you are.
const bar = ref<HTMLElement>()
let frame = 0

function update() {
  frame = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  const progress = max > 0 ? window.scrollY / max : 0
  bar.value?.style.setProperty('transform', `scaleX(${progress.toFixed(4)})`)
}

const onScroll = () => {
  if (!frame) frame = requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="track" aria-hidden="true">
    <div ref="bar" class="bar" />
  </div>
</template>

<style scoped>
.track {
  position: fixed;
  inset: 0 0 auto;
  z-index: 70;
  height: 3px;
  pointer-events: none;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3));
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent-2) 70%, transparent);
  transform: scaleX(0);
  transform-origin: left;
}
</style>
