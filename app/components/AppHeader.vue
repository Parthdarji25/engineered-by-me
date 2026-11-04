<script setup lang="ts">
import { navLinks, profile } from '~/data/profile'

const route = useRoute()
const isOpen = ref(false)
const scrolled = ref(false)
const spyId = ref('home')
const menuButton = ref<HTMLButtonElement>()

// On the homepage the scroll-spy decides; on a project page "Projects" is active.
const activeId = computed(() => {
  if (route.path === '/') return spyId.value
  return route.path.startsWith('/projects') ? 'projects' : ''
})

const close = () => (isOpen.value = false)
const smooth = useSmoothScroll()

// Lock page scroll (native and Lenis) while the mobile menu is open.
watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) smooth.stop()
  else {
    smooth.start()
    menuButton.value?.focus({ preventScroll: true })
  }
})

let sectionObserver: IntersectionObserver | undefined
let desktopQuery: MediaQueryList | undefined

const onScroll = () => (scrolled.value = window.scrollY > 12)
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) close()
}
const onBreakpoint = (e: MediaQueryListEvent) => {
  if (e.matches) close()
}

// Scroll-spy: highlight the nav link of the section in the middle of the screen.
function observeSections() {
  sectionObserver?.disconnect()
  sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) spyId.value = entry.target.id
    }
  }, { rootMargin: '-45% 0px -50% 0px' })

  for (const link of navLinks) {
    const section = document.getElementById(link.id)
    if (section) sectionObserver.observe(section)
  }
}

// The header lives in the layout, so it survives page changes: re-scan after each one.
const nuxtApp = useNuxtApp()
const offPageFinish = nuxtApp.hook('page:finish', () => {
  close()
  observeSections()
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)

  desktopQuery = window.matchMedia('(min-width: 900px)')
  desktopQuery.addEventListener('change', onBreakpoint)

  observeSections()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  desktopQuery?.removeEventListener('change', onBreakpoint)
  sectionObserver?.disconnect()
  offPageFinish()
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="header" :class="{ 'is-scrolled': scrolled || isOpen }">
    <div class="container bar">
      <NuxtLink to="/" class="brand" :aria-label="`${profile.name} — home`" @click="close">
        <AppLogo />
      </NuxtLink>

      <nav class="nav-desktop" aria-label="Primary">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.id"
          :to="`/#${link.id}`"
          class="nav-link"
          :class="{ active: activeId === link.id }"
          :aria-current="activeId === link.id ? 'location' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="actions">
        <ThemeToggle />
        <NuxtLink v-magnetic="0.2" to="/#contact" class="btn btn-primary hire">
          Let's talk
        </NuxtLink>
        <button
          ref="menuButton"
          class="menu-btn"
          type="button"
          :aria-expanded="isOpen"
          aria-controls="mobile-menu"
          :aria-label="isOpen ? 'Close menu' : 'Open menu'"
          @click="isOpen = !isOpen"
        >
          <AppIcon :name="isOpen ? 'close' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="menu">
      <nav v-show="isOpen" id="mobile-menu" class="nav-mobile" aria-label="Mobile" data-lenis-prevent>
        <ul>
          <li v-for="(link, i) in navLinks" :key="link.id" :style="{ '--i': i }">
            <NuxtLink :to="`/#${link.id}`" :class="{ active: activeId === link.id }" @click="close">
              <span class="num">0{{ i + 1 }}</span>
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
        <div class="mobile-socials">
          <a
            v-for="social in profile.socials"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.label"
          >
            <AppIcon :name="social.icon" />
          </a>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  border-bottom: 1px solid transparent;
  transition: background-color 0.3s var(--ease), border-color 0.3s var(--ease), backdrop-filter 0.3s;
}

.header.is-scrolled {
  background: var(--header-bg);
  border-bottom-color: var(--border);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--header-h);
}

.brand {
  display: flex;
  align-items: center;
  min-width: 0;
  border-radius: 12px;
}

.nav-desktop {
  display: none;
  gap: 4px;
  padding: 5px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.nav-link {
  position: relative;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.2s, background-color 0.2s;
}

.nav-link:hover {
  color: var(--text);
}

.nav-link.active {
  color: var(--text);
  background: var(--surface-strong);
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hire {
  display: none;
  min-height: 42px;
  padding: 0 18px;
  font-size: 14px;
}

.menu-btn {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
}

/* Mobile menu */
.nav-mobile {
  position: fixed;
  inset: var(--header-h) 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px var(--gutter) 40px;
  background: var(--bg);
  overflow-y: auto;
}

.nav-mobile ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-mobile li {
  border-bottom: 1px solid var(--border);
  animation: slide-in 0.5s var(--ease) both;
  animation-delay: calc(var(--i) * 50ms + 80ms);
}

.nav-mobile li a {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 18px 4px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-muted);
}

.nav-mobile li a.active,
.nav-mobile li a:hover {
  color: var(--text);
}

.num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent-2);
}

.mobile-socials {
  display: flex;
  gap: 12px;
  padding-top: 32px;
}

.mobile-socials a {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.3s var(--ease), transform 0.3s var(--ease);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
}

@media (min-width: 560px) {
  .hire {
    display: inline-flex;
  }
}

@media (min-width: 900px) {
  .nav-desktop {
    display: flex;
  }

  .menu-btn,
  .nav-mobile {
    display: none !important;
  }
}
</style>
