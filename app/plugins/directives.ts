import type { Directive } from 'vue'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── v-reveal ────────────────────────────────────────────────────────────────
// Fades/slides an element in when it enters the viewport.
// Usage: <div v-reveal>  or  <div v-reveal="120">  (delay in ms)
const revealObservers = new WeakMap<HTMLElement, IntersectionObserver>()

const reveal: Directive<HTMLElement, number | undefined> = {
  // SSR: render the attribute so CSS can hide the element before JS runs.
  getSSRProps(binding) {
    return {
      'data-reveal': '',
      'style': binding.value ? { transitionDelay: `${binding.value}ms` } : undefined,
    }
  },
  mounted(el, binding) {
    el.setAttribute('data-reveal', '')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      el.dataset.visible = ''
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        el.dataset.visible = ''
        observer.disconnect()
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })

    observer.observe(el)
    revealObservers.set(el, observer)
  },
  unmounted(el) {
    revealObservers.get(el)?.disconnect()
    revealObservers.delete(el)
  },
}

// ── v-tilt ──────────────────────────────────────────────────────────────────
// 3D perspective tilt that follows the mouse. Ignored for touch and reduced motion.
// Usage: <article v-tilt>  or  <article v-tilt="8">  (max degrees)
type TiltElement = HTMLElement & { _tiltCleanup?: () => void }

const tilt: Directive<TiltElement, number | undefined> = {
  getSSRProps: () => ({}),
  mounted(el, binding) {
    const max = binding.value ?? 6

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width // 0 → 1
      const y = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--tilt-x', `${(0.5 - y) * max * 2}deg`)
      el.style.setProperty('--tilt-y', `${(x - 0.5) * max * 2}deg`)
      el.style.setProperty('--glare-x', `${x * 100}%`)
      el.style.setProperty('--glare-y', `${y * 100}%`)
      el.classList.add('is-tilting')
    }

    const onLeave = () => {
      el.style.setProperty('--tilt-x', '0deg')
      el.style.setProperty('--tilt-y', '0deg')
      el.classList.remove('is-tilting')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el._tiltCleanup = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  },
  unmounted(el) {
    el._tiltCleanup?.()
  },
}

// ── v-magnetic ──────────────────────────────────────────────────────────────
// The element is gently pulled toward the cursor while hovered (buttons, CTAs).
// Usage: <a v-magnetic>  or  <a v-magnetic="0.4">  (strength, 0–1)
type MagneticElement = HTMLElement & { _magneticCleanup?: () => void }

const magnetic: Directive<MagneticElement, number | undefined> = {
  getSSRProps: () => ({}),
  mounted(el, binding) {
    const strength = binding.value ?? 0.3

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      el.style.setProperty('--mag-x', `${x * strength}px`)
      el.style.setProperty('--mag-y', `${y * strength}px`)
    }
    const onLeave = () => {
      el.style.setProperty('--mag-x', '0px')
      el.style.setProperty('--mag-y', '0px')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    el._magneticCleanup = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  },
  unmounted(el) {
    el._magneticCleanup?.()
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
  nuxtApp.vueApp.directive('tilt', tilt)
  nuxtApp.vueApp.directive('magnetic', magnetic)
})
