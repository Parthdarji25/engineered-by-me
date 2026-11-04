/**
 * Scroll to a position or element using Lenis when it's running,
 * or the browser's native scrolling otherwise (reduced motion / SSR).
 */
export function useSmoothScroll() {
  const nuxtApp = useNuxtApp()

  function scrollTo(target: number | string | HTMLElement, options: { immediate?: boolean } = {}) {
    const lenis = nuxtApp.$lenis as import('lenis').default | null | undefined
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target

    if (lenis) {
      if (el !== null) lenis.scrollTo(el, { immediate: options.immediate })
      return
    }
    if (typeof el === 'number') window.scrollTo({ top: el })
    else el?.scrollIntoView()
  }

  const stop = () => (nuxtApp.$lenis as import('lenis').default | null | undefined)?.stop()
  const start = () => (nuxtApp.$lenis as import('lenis').default | null | undefined)?.start()

  return { scrollTo, stop, start }
}
