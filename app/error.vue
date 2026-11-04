<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: is404.value ? 'Page not found' : 'Something went wrong',
  // Error pages should never appear in search results.
  robots: 'noindex, nofollow',
})
</script>

<template>
  <main class="error">
    <p class="code gradient-text">
      {{ error.statusCode }}
    </p>
    <h1>{{ is404 ? "This page doesn't exist." : 'Something went wrong.' }}</h1>
    <button type="button" class="btn btn-primary" @click="clearError({ redirect: '/' })">
      Back to home
    </button>
  </main>
</template>

<style scoped>
.error {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 20px;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
}

.code {
  font-size: clamp(80px, 18vw, 160px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
}

h1 {
  font-size: clamp(22px, 4vw, 32px);
}
</style>
