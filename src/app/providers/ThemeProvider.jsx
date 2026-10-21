import { useEffect, useState } from 'react'
import { ThemeContext } from '@/shared/state'
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('gamesense-theme')
      return ['light', 'dark', 'system'].includes(saved) ? saved : 'light'
    } catch {
      return 'light'
    }
  })
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
    }
    apply()
    try {
      localStorage.setItem('gamesense-theme', theme)
    } catch {
      /* Theme still works when storage is unavailable. */
    }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
