import Lenis from 'lenis'

/**
 * Site-wide smooth scrolling (Lenis). Browser only (`.client.ts`).
 * - Wheel/trackpad scrolling is eased; touch keeps native momentum.
 * - In-page links (href="#id") glide to their target, honouring scroll-margin-top.
 * - Turned off entirely for visitors who prefer reduced motion.
 * Available anywhere as `useNuxtApp().$lenis` (or via useSmoothScroll()).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lenis = reduced
    ? null
    : new Lenis({
        autoRaf: true,
        lerp: 0.09,
        wheelMultiplier: 1,
        smoothWheel: true,
      })

  // Glide to in-page anchors instead of jumping.
  document.addEventListener('click', (event) => {
    if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
    const link = (event.target as HTMLElement).closest('a')
    const href = link?.getAttribute('href')
    if (!href?.startsWith('#') || href.length < 2) return
    const target = document.getElementById(decodeURIComponent(href.slice(1)))
    if (!target) return
    event.preventDefault()
    lenis.scrollTo(target)
    history.replaceState(history.state, '', href)
  })

  // Page height changes after navigation; let Lenis re-measure.
  nuxtApp.hook('page:finish', () => lenis?.resize())

  return {
    provide: { lenis },
  }
})
