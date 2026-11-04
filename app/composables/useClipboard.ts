/** Copy text to the clipboard; `copied` flips to true for a moment for UI feedback. */
export function useClipboard(resetAfter = 2000) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    }
    catch {
      // Fallback for older browsers / non-secure contexts.
      const input = document.createElement('textarea')
      input.value = text
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), resetAfter)
  }

  onBeforeUnmount(() => clearTimeout(timer))

  return { copied, copy }
}
