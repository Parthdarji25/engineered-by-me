/** Reactive `prefers-reduced-motion` flag. Always false during SSR. */
export function useReducedMotion() {
  const reduced = ref(false)
  let query: MediaQueryList | undefined

  const update = () => {
    reduced.value = !!query?.matches
  }

  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    query.addEventListener('change', update)
  })

  onBeforeUnmount(() => query?.removeEventListener('change', update))

  return reduced
}
