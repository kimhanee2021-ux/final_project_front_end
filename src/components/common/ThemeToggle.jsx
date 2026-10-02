import { useTheme } from '../../hooks/useTheme'
import Icon from './Icon'
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <div className="theme-toggle" role="group" aria-label="화면 테마">
    {[['light', 'sun', '라이트'], ['dark', 'moon', '다크'], ['system', 'monitor', '시스템']].map(([value, icon, label]) =>
      <button key={value} title={label + ' 모드'} aria-label={label + ' 모드'} aria-pressed={theme === value} className={theme === value ? 'selected' : ''} onClick={() => setTheme(value)}><Icon name={icon} size={17} /></button>)}
  </div>
}
