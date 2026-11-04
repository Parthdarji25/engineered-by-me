<script setup lang="ts">
const { isDark, toggle } = useTheme()
const label = computed(() => (isDark.value ? 'Switch to light theme' : 'Switch to dark theme'))
</script>

<template>
  <button class="toggle" type="button" :aria-label="label" :title="label" @click="toggle">
    <Transition name="spin" mode="out-in">
      <AppIcon v-if="isDark" key="sun" name="sun" :size="19" />
      <AppIcon v-else key="moon" name="moon" :size="19" />
    </Transition>
  </button>
</template>

<style scoped>
.toggle {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.toggle:hover {
  color: var(--text);
  background: var(--surface-strong);
  border-color: var(--border-strong);
}

.spin-enter-active,
.spin-leave-active {
  transition: transform 0.3s var(--ease), opacity 0.3s var(--ease);
}

.spin-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}

.spin-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>
