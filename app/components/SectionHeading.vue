<script setup lang="ts">
const props = defineProps<{
  eyebrow: string
  title: string
  id?: string
}>()

// Each word slides up from behind a mask; the last word gets the gradient.
const words = computed(() => props.title.split(' '))
</script>

<template>
  <header class="heading">
    <p v-reveal class="eyebrow">
      <span class="eyebrow-line" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h2 :id="id" v-reveal="80" class="title" :aria-label="title">
      <template v-for="(word, i) in words" :key="i">
        <span class="word" aria-hidden="true"><span class="word-inner" :class="{ 'gradient-text': i === words.length - 1 }" :style="{ '--i': i }">{{ word }}</span></span>{{ i < words.length - 1 ? ' ' : '' }}
      </template>
    </h2>
    <p v-if="$slots.default" v-reveal="160" class="lead">
      <slot />
    </p>
  </header>
</template>

<style scoped>
.heading {
  max-width: 720px;
  margin-bottom: clamp(40px, 6vw, 64px);
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-2);
  margin-bottom: 16px;
}

.eyebrow-line {
  width: 28px;
  height: 1px;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  transform-origin: left;
  transition: transform 1s var(--ease) 0.2s;
}

.js .eyebrow:not([data-visible]) .eyebrow-line {
  transform: scaleX(0);
}

.title {
  font-size: clamp(30px, 4.6vw, 50px);
  font-weight: 750;
}

.word {
  display: inline-block;
  overflow: hidden;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
  vertical-align: top;
}

.word-inner {
  display: inline-block;
  transition: transform 1s var(--ease);
  transition-delay: calc(var(--i) * 70ms + 80ms);
}

/* The heading itself doesn't blur or slide — its words do. */
.js .title[data-reveal] {
  filter: none;
  transform: none;
}

.js .title .word-inner {
  transform: translateY(110%) rotate(4deg);
}

.js .title[data-visible] .word-inner {
  transform: none;
}

.lead {
  margin-top: 16px;
  font-size: clamp(16px, 1.6vw, 18px);
  color: var(--text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .js .title .word-inner {
    transform: none;
  }
}
</style>
