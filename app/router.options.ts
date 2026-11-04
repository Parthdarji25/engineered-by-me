import type { RouterConfig } from '@nuxt/schema'

/**
 * Scroll behaviour for route changes, coordinated with Lenis smooth scrolling
 * and the page transition:
 *  - back/forward       → restore the saved position
 *  - same page + #hash  → glide to the section
 *  - new page (+ #hash) → wait for the page transition, then jump there
 */
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const { scrollTo } = useSmoothScroll()
    const nuxtApp = useNuxtApp()

    const scrollToHash = (immediate: boolean) => {
      const el = to.hash ? document.getElementById(decodeURIComponent(to.hash.slice(1))) : null
      if (el) scrollTo(el, { immediate })
    }

    // First load: no page transition runs, so handle a #hash once the page has painted.
    if (from.matched.length === 0) {
      if (to.hash) setTimeout(() => scrollToHash(true), 100)
      return false
    }

    if (to.path === from.path) {
      if (to.hash) scrollToHash(false)
      return false
    }

    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:transition:finish', () => {
        requestAnimationFrame(() => {
          if (savedPosition) scrollTo(savedPosition.top, { immediate: true })
          else if (to.hash) scrollToHash(true)
          else scrollTo(0, { immediate: true })
          resolve(false)
        })
      })
    })
  },
}
