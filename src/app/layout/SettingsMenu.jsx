import { useRef, useState } from 'react'
import { GSIcon } from '@/shared/ui'
import { useTheme } from '@/shared/state'
import { useDismiss } from '@/shared/hooks'

const THEMES = [
  ['light', '라이트', 'sun'],
  ['dark', '다크', 'moon'],
]

const choice = selected =>
  `flex-1 flex items-center justify-center gap-[6px] h-[34px] rounded-full text-[12px] font-[600] ${
    selected ? 'bg-gs-accent text-gs-on-accent' : 'bg-transparent text-gs-muted hover:text-gs-text'
  }`

// 설정 메뉴: 다크/라이트 모드 전환.
export default function SettingsMenu() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="w-[38px] h-[38px] grid place-items-center bg-transparent text-gs-muted rounded-full p-0 hover:bg-gs-hover hover:text-gs-mint"
        aria-label="설정"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <GSIcon name="settings" size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] w-[260px] p-[18px] grid gap-[16px] bg-gs-panel rounded-[20px] shadow-[var(--gs-shadow)] animate-[gs-appear_.15s_ease]">
          <div>
            <p className="text-[12px] text-gs-muted mb-[8px]">화면 모드</p>
            <div className="flex p-[3px] rounded-full bg-gs-raised" role="group" aria-label="화면 모드">
              {THEMES.map(([value, label, icon]) => (
                <button key={value} type="button" className={choice(theme === value)} aria-pressed={theme === value} onClick={() => setTheme(value)}>
                  <GSIcon name={icon} size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
