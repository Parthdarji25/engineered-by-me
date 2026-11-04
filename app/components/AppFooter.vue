<script setup lang="ts">
import { navLinks, profile } from '~/data/profile'

const year = new Date().getFullYear()

const { scrollTo } = useSmoothScroll()
const backToTop = () => scrollTo(0)
</script>

<template>
  <footer class="footer">
    <div class="container inner">
      <div class="brand">
        <NuxtLink to="/" class="home" :aria-label="`${profile.name} — home`">
          <AppLogo variant="compact" :size="36" />
        </NuxtLink>
        <p class="tag">
          {{ profile.title }} · Frontend · Backend · GenAI · AI
        </p>
      </div>

      <nav class="links" aria-label="Footer">
        <NuxtLink v-for="link in navLinks" :key="link.id" :to="`/#${link.id}`">
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="socials">
        <a
          v-for="social in profile.socials"
          :key="social.label"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="social.label"
        >
          <AppIcon :name="social.icon" :size="18" />
        </a>
        <button type="button" class="top" aria-label="Back to top" @click="backToTop">
          <AppIcon name="arrowUp" :size="18" />
        </button>
      </div>
    </div>
    <div class="container bottom">
      <p>© {{ year }} {{ profile.name }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  padding-top: 48px;
}

.inner {
  display: grid;
  gap: 28px;
  align-items: center;
}

.home {
  display: inline-flex;
  border-radius: 12px;
}

.tag {
  margin-top: 12px;
  color: var(--text-dim);
  font-size: 14px;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.links a {
  color: var(--text-muted);
  font-size: 14.5px;
  transition: color 0.2s;
}

.links a:hover {
  color: var(--text);
}

.socials {
  display: flex;
  gap: 8px;
}

.socials a,
.top {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  transition: color 0.2s, border-color 0.2s;
}

.socials a:hover,
.top:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.top {
  margin-left: 8px;
}

.bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 24px;
  margin-top: 40px;
  padding-block: 24px;
  border-top: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 13.5px;
}

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1fr auto auto;
    gap: 48px;
  }
}
</style>
