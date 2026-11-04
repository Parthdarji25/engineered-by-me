<template>
  <div class="layout">
    <a class="skip-link" href="#main">Skip to content</a>
    <ScrollProgress />
    <AppHeader />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  outline: none;
}

.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  font-weight: 600;
  transform: translateY(-150%);
  transition: transform 0.2s var(--ease);
}

.skip-link:focus {
  transform: none;
}
</style>
