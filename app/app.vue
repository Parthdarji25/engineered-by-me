<script setup lang="ts">
// Dummy comment
const { init, theme } = useTheme()

// Keep the browser's UI colour (mobile address bar) in step with the site theme.
useHead({
  meta: [{ name: 'theme-color', content: computed(() => THEME_COLOR[theme.value]) }],
})

// Sync theme state with what the boot script applied — after hydration, so the
// server and client render the same markup first.
onMounted(init)
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
