export type Theme = 'dark' | 'light'

/** Browser UI colour (mobile address bar) for each theme — matches --bg in main.css. */
export const THEME_COLOR: Record<Theme, string> = { dark: '#07070d', light: '#f6f6fb' }

/**
 * Shared light/dark theme state.
 * `useState` makes the value SSR-safe and shared by every component that calls this.
 * The initial theme is applied by an inline script in nuxt.config.ts (no flash);
 * `init()` syncs this state with it after hydration.
 */
export function useTheme() {
  const theme = useState<Theme>('theme', () => 'dark')
  const isDark = computed(() => theme.value === 'dark')

  function apply(value: Theme) {
    theme.value = value
    document.documentElement.dataset.theme = value
    try {
      localStorage.setItem('theme', value)
    }
    catch {
      // Storage can be blocked (private mode); the theme still applies for this visit.
    }
  }

  function init() {
    const current = document.documentElement.dataset.theme
    theme.value = current === 'light' ? 'light' : 'dark'
  }

  const toggle = () => apply(isDark.value ? 'light' : 'dark')

  return { theme, isDark, toggle, init }
}
